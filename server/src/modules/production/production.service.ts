import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Not } from 'typeorm';
import { Production, MilkingSession, ProductionStatus } from './entities/production.entity';
import { CattleService } from '../cattle/cattle.service';
import {
  CreateProductionDto,
  UpdateProductionDto,
  ProductionFilterDto,
  BulkProductionDto,
  VerifyProductionDto,
} from './dto';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductionSummary {
  date: Date;
  morning: number;
  evening: number;
  total: number;
  cattleCount: number;
  averagePerCow: number;
}

export interface ProductionStatistics {
  totalProduction: number;
  averageDaily: number;
  averagePerCow: number;
  highestDaily: number;
  lowestDaily: number;
  totalCattle: number;
  activeCattle: number;
  qualityDistribution: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    ungraded: number;
  };
  statusDistribution: {
    recorded: number;
    verified: number;
    rejected: number;
  };
}

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Production)
    private productionRepository: Repository<Production>,
    private cattleService: CattleService,
  ) {}

  async create(createProductionDto: CreateProductionDto, recordedById: number): Promise<Production> {
    // Validate cattle exists and can produce milk
    const cattle = await this.cattleService.findOne(createProductionDto.cattleId);
    
    if (!cattle.canMilk) {
      throw new BadRequestException(
        `Cattle ${cattle.name} (${cattle.tagNumber}) is not eligible for milk production`
      );
    }

    // Check for duplicate production record
    const existingProduction = await this.productionRepository.findOne({
      where: {
        cattleId: createProductionDto.cattleId,
        date: new Date(createProductionDto.date),
        session: createProductionDto.session,
      },
    });

    if (existingProduction) {
      throw new ConflictException(
        `Production record already exists for ${cattle.name} on ${createProductionDto.date} ${createProductionDto.session} session`
      );
    }

    const production = this.productionRepository.create({
      ...createProductionDto,
      date: new Date(createProductionDto.date),
      recordedById,
    });

    return this.productionRepository.save(production);
  }

  async bulkCreate(bulkDto: BulkProductionDto, recordedById: number): Promise<Production[]> {
    const results: Production[] = [];
    const errors: string[] = [];

    for (const productionDto of bulkDto.productions) {
      try {
        const production = await this.create(productionDto, recordedById);
        results.push(production);
      } catch (error) {
        errors.push(`${productionDto.cattleId}-${productionDto.date}-${productionDto.session}: ${error.message}`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new BadRequestException(`All records failed: ${errors.join('; ')}`);
    }

    // Return successfully created records even if some failed
    return results;
  }

  async findAll(filters: ProductionFilterDto): Promise<PaginatedResult<Production>> {
    const queryBuilder = this.createFilteredQuery(filters);

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Apply sorting
    const sortField = this.getSortField(filters.sortBy);
    queryBuilder.orderBy(sortField, filters.sortOrder || 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Production> {
    const production = await this.productionRepository.findOne({
      where: { id },
      relations: ['cattle', 'recordedBy', 'verifiedBy'],
    });

    if (!production) {
      throw new NotFoundException(`Production record with ID ${id} not found`);
    }

    return production;
  }

  async update(id: number, updateProductionDto: UpdateProductionDto): Promise<Production> {
    const production = await this.findOne(id);

    // Only allow updates for recorded status
    if (production.status !== ProductionStatus.RECORDED) {
      throw new BadRequestException(
        `Cannot update production record with status: ${production.status}`
      );
    }

    // Check for duplicate if date or session is being updated
    if (updateProductionDto.date || updateProductionDto.session) {
      const newDate = updateProductionDto.date ? new Date(updateProductionDto.date) : production.date;
      const newSession = updateProductionDto.session || production.session;

      const existingProduction = await this.productionRepository.findOne({
        where: {
          cattleId: production.cattleId,
          date: newDate,
          session: newSession,
          id: Not(id) as any,
        },
      });

      if (existingProduction) {
        throw new ConflictException(
          `Production record already exists for this cattle on ${newDate.toISOString().split('T')[0]} ${newSession} session`
        );
      }
    }

    Object.assign(production, updateProductionDto);
    
    if (updateProductionDto.date) {
      production.date = new Date(updateProductionDto.date);
    }

    return this.productionRepository.save(production);
  }

  async verify(id: number, verifyDto: VerifyProductionDto, verifiedById: number): Promise<Production> {
    const production = await this.findOne(id);

    if (production.status !== ProductionStatus.RECORDED) {
      throw new BadRequestException(
        `Production record is already ${production.status}`
      );
    }

    production.status = verifyDto.status;
    production.verifiedById = verifiedById;
    production.verifiedAt = new Date();
    
    if (verifyDto.notes) {
      production.notes = production.notes 
        ? `${production.notes}\n\nVerification: ${verifyDto.notes}`
        : `Verification: ${verifyDto.notes}`;
    }

    return this.productionRepository.save(production);
  }

  async remove(id: number): Promise<void> {
    const production = await this.findOne(id);
    
    // Only allow deletion of recorded status
    if (production.status !== ProductionStatus.RECORDED) {
      throw new BadRequestException(
        `Cannot delete production record with status: ${production.status}`
      );
    }

    production.deletedAt = new Date();
    await this.productionRepository.save(production);
  }

  async getDailySummary(date: string): Promise<ProductionSummary> {
    const targetDate = new Date(date);
    
    const productions = await this.productionRepository
      .createQueryBuilder('production')
      .leftJoinAndSelect('production.cattle', 'cattle')
      .where('production.date = :date', { date: targetDate })
      .andWhere('production.deletedAt IS NULL')
      .getMany();

    const morning = productions
      .filter(p => p.session === MilkingSession.MORNING)
      .reduce((sum, p) => sum + Number(p.quantity), 0);

    const evening = productions
      .filter(p => p.session === MilkingSession.EVENING)
      .reduce((sum, p) => sum + Number(p.quantity), 0);

    const total = morning + evening;
    const cattleCount = new Set(productions.map(p => p.cattleId)).size;
    const averagePerCow = cattleCount > 0 ? total / cattleCount : 0;

    return {
      date: targetDate,
      morning,
      evening,
      total,
      cattleCount,
      averagePerCow: Math.round(averagePerCow * 100) / 100,
    };
  }

  async getMonthlyReport(year: number, month: number): Promise<ProductionSummary[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const dailySummaries: ProductionSummary[] = [];
    
    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDate = new Date(year, month - 1, day);
      const summary = await this.getDailySummary(currentDate.toISOString().split('T')[0]);
      dailySummaries.push(summary);
    }

    return dailySummaries;
  }

  async getStatistics(fromDate?: string, toDate?: string): Promise<ProductionStatistics> {
    const queryBuilder = this.productionRepository
      .createQueryBuilder('production')
      .leftJoinAndSelect('production.cattle', 'cattle')
      .where('production.deletedAt IS NULL');

    if (fromDate) {
      queryBuilder.andWhere('production.date >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('production.date <= :toDate', { toDate });
    }

    const productions = await queryBuilder.getMany();

    if (productions.length === 0) {
      return {
        totalProduction: 0,
        averageDaily: 0,
        averagePerCow: 0,
        highestDaily: 0,
        lowestDaily: 0,
        totalCattle: 0,
        activeCattle: 0,
        qualityDistribution: { gradeA: 0, gradeB: 0, gradeC: 0, ungraded: 0 },
        statusDistribution: { recorded: 0, verified: 0, rejected: 0 },
      };
    }

    const totalProduction = productions.reduce((sum, p) => sum + Number(p.quantity), 0);
    const uniqueDates = new Set(productions.map(p => p.date.toISOString().split('T')[0]));
    const averageDaily = totalProduction / uniqueDates.size;
    
    const uniqueCattle = new Set(productions.map(p => p.cattleId));
    const averagePerCow = totalProduction / uniqueCattle.size;

    // Calculate daily totals for min/max
    const dailyTotals = Array.from(uniqueDates).map(date => {
      return productions
        .filter(p => p.date.toISOString().split('T')[0] === date)
        .reduce((sum, p) => sum + Number(p.quantity), 0);
    });

    const highestDaily = Math.max(...dailyTotals);
    const lowestDaily = Math.min(...dailyTotals);

    // Quality distribution
    const qualityDistribution = {
      gradeA: productions.filter(p => p.qualityGrade === 'A').length,
      gradeB: productions.filter(p => p.qualityGrade === 'B').length,
      gradeC: productions.filter(p => p.qualityGrade === 'C').length,
      ungraded: productions.filter(p => p.qualityGrade === null).length,
    };

    // Status distribution
    const statusDistribution = {
      recorded: productions.filter(p => p.status === ProductionStatus.RECORDED).length,
      verified: productions.filter(p => p.status === ProductionStatus.VERIFIED).length,
      rejected: productions.filter(p => p.status === ProductionStatus.REJECTED).length,
    };

    return {
      totalProduction: Math.round(totalProduction * 100) / 100,
      averageDaily: Math.round(averageDaily * 100) / 100,
      averagePerCow: Math.round(averagePerCow * 100) / 100,
      highestDaily: Math.round(highestDaily * 100) / 100,
      lowestDaily: Math.round(lowestDaily * 100) / 100,
      totalCattle: uniqueCattle.size,
      activeCattle: uniqueCattle.size, // All cattle in productions are considered active
      qualityDistribution,
      statusDistribution,
    };
  }

  async getCattleProductionHistory(
    cattleId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<Production[]> {
    // Verify cattle exists
    await this.cattleService.findOne(cattleId);

    const queryBuilder = this.productionRepository
      .createQueryBuilder('production')
      .leftJoinAndSelect('production.cattle', 'cattle')
      .leftJoinAndSelect('production.recordedBy', 'recordedBy')
      .leftJoinAndSelect('production.verifiedBy', 'verifiedBy')
      .where('production.cattleId = :cattleId', { cattleId })
      .andWhere('production.deletedAt IS NULL');

    if (fromDate) {
      queryBuilder.andWhere('production.date >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('production.date <= :toDate', { toDate });
    }

    return queryBuilder
      .orderBy('production.date', 'DESC')
      .addOrderBy('production.session', 'ASC')
      .getMany();
  }

  private createFilteredQuery(filters: ProductionFilterDto): SelectQueryBuilder<Production> {
    const queryBuilder = this.productionRepository
      .createQueryBuilder('production')
      .leftJoinAndSelect('production.cattle', 'cattle')
      .leftJoinAndSelect('production.recordedBy', 'recordedBy')
      .leftJoinAndSelect('production.verifiedBy', 'verifiedBy')
      .where('production.deletedAt IS NULL');

    // Apply filters
    if (filters.session) {
      queryBuilder.andWhere('production.session = :session', { session: filters.session });
    }

    if (filters.status) {
      queryBuilder.andWhere('production.status = :status', { status: filters.status });
    }

    if (filters.cattleId) {
      queryBuilder.andWhere('production.cattleId = :cattleId', { cattleId: filters.cattleId });
    }

    if (filters.date) {
      queryBuilder.andWhere('production.date = :date', { date: filters.date });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('production.date >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('production.date <= :toDate', { toDate: filters.toDate });
    }

    if (filters.minQuantity) {
      queryBuilder.andWhere('production.quantity >= :minQuantity', { minQuantity: filters.minQuantity });
    }

    if (filters.maxQuantity) {
      queryBuilder.andWhere('production.quantity <= :maxQuantity', { maxQuantity: filters.maxQuantity });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(cattle.name) LIKE LOWER(:search) OR LOWER(cattle.tagNumber) LIKE LOWER(:search))',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder;
  }

  private getSortField(sortBy?: string): string {
    const allowedFields = ['date', 'session', 'quantity', 'fatContent', 'proteinContent', 'status', 'createdAt'];
    return allowedFields.includes(sortBy || '') ? `production.${sortBy}` : 'production.date';
  }
}