import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Cattle, CattleStatus } from './entities/cattle.entity';
import { CreateCattleDto, UpdateCattleDto, CattleFilterDto } from './dto';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CattleService {
  constructor(
    @InjectRepository(Cattle)
    private cattleRepository: Repository<Cattle>,
  ) {}

  async create(createCattleDto: CreateCattleDto): Promise<Cattle> {
    // Check if tag number already exists
    const existingCattle = await this.cattleRepository.findOne({
      where: { tagNumber: createCattleDto.tagNumber },
    });

    if (existingCattle) {
      throw new ConflictException(
        `Cattle with tag number ${createCattleDto.tagNumber} already exists`,
      );
    }

    // Validate parent relationships
    if (createCattleDto.parentBullId) {
      const parentBull = await this.cattleRepository.findOne({
        where: { id: createCattleDto.parentBullId },
      });
      if (!parentBull) {
        throw new BadRequestException('Parent bull not found');
      }
      if (parentBull.gender !== 'male') {
        throw new BadRequestException('Parent bull must be male');
      }
    }

    if (createCattleDto.parentCowId) {
      const parentCow = await this.cattleRepository.findOne({
        where: { id: createCattleDto.parentCowId },
      });
      if (!parentCow) {
        throw new BadRequestException('Parent cow not found');
      }
      if (parentCow.gender !== 'female') {
        throw new BadRequestException('Parent cow must be female');
      }
    }

    const cattle = this.cattleRepository.create(createCattleDto);
    
    if (createCattleDto.birthDate) {
      cattle.birthDate = new Date(createCattleDto.birthDate);
    }

    return this.cattleRepository.save(cattle);
  }

  async findAll(filters: CattleFilterDto): Promise<PaginatedResult<Cattle>> {
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

  async findOne(id: number): Promise<Cattle> {
    const cattle = await this.cattleRepository.findOne({
      where: { id },
      relations: ['parentBull', 'parentCow', 'offspringAsBull', 'offspringAsCow'],
    });

    if (!cattle) {
      throw new NotFoundException(`Cattle with ID ${id} not found`);
    }

    return cattle;
  }

  async findByTagNumber(tagNumber: string): Promise<Cattle> {
    const cattle = await this.cattleRepository.findOne({
      where: { tagNumber },
      relations: ['parentBull', 'parentCow'],
    });

    if (!cattle) {
      throw new NotFoundException(`Cattle with tag number ${tagNumber} not found`);
    }

    return cattle;
  }

  async update(id: number, updateCattleDto: UpdateCattleDto): Promise<Cattle> {
    const cattle = await this.findOne(id);

    // Check if tag number is being changed and if it conflicts
    if (updateCattleDto.tagNumber && updateCattleDto.tagNumber !== cattle.tagNumber) {
      const existingCattle = await this.cattleRepository.findOne({
        where: { tagNumber: updateCattleDto.tagNumber },
      });

      if (existingCattle) {
        throw new ConflictException(
          `Cattle with tag number ${updateCattleDto.tagNumber} already exists`,
        );
      }
    }

    // Validate parent relationships if being updated
    if (updateCattleDto.parentBullId) {
      const parentBull = await this.cattleRepository.findOne({
        where: { id: updateCattleDto.parentBullId },
      });
      if (!parentBull || parentBull.gender !== 'male') {
        throw new BadRequestException('Invalid parent bull');
      }
    }

    if (updateCattleDto.parentCowId) {
      const parentCow = await this.cattleRepository.findOne({
        where: { id: updateCattleDto.parentCowId },
      });
      if (!parentCow || parentCow.gender !== 'female') {
        throw new BadRequestException('Invalid parent cow');
      }
    }

    Object.assign(cattle, updateCattleDto);
    
    if (updateCattleDto.birthDate) {
      cattle.birthDate = new Date(updateCattleDto.birthDate);
    }

    return this.cattleRepository.save(cattle);
  }

  async updateStatus(id: number, status: CattleStatus): Promise<Cattle> {
    const cattle = await this.findOne(id);
    cattle.status = status;
    return this.cattleRepository.save(cattle);
  }

  async remove(id: number): Promise<void> {
    const cattle = await this.findOne(id);
    
    // Soft delete by setting deletedAt
    cattle.deletedAt = new Date();
    await this.cattleRepository.save(cattle);
  }

  async getOffspring(id: number): Promise<Cattle[]> {
    const cattle = await this.findOne(id);
    
    return this.cattleRepository.find({
      where: [
        { parentBullId: id },
        { parentCowId: id },
      ],
      relations: ['parentBull', 'parentCow'],
    });
  }

  async getActiveMilkingCows(): Promise<Cattle[]> {
    return this.cattleRepository
      .createQueryBuilder('cattle')
      .where('cattle.gender = :gender', { gender: 'female' })
      .andWhere('cattle.status = :status', { status: CattleStatus.ACTIVE })
      .andWhere('cattle.deletedAt IS NULL')
      .andWhere(
        'EXTRACT(YEAR FROM AGE(cattle.birthDate)) >= :minAge',
        { minAge: 2 }
      )
      .orderBy('cattle.name', 'ASC')
      .getMany();
  }

  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<CattleStatus, number>;
    byGender: { male: number; female: number };
    averageAge: number;
  }> {
    const queryBuilder = this.cattleRepository
      .createQueryBuilder('cattle')
      .where('cattle.deletedAt IS NULL');

    const [total, cattle] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.getMany(),
    ]);

    const byStatus = cattle.reduce((acc, cow) => {
      acc[cow.status] = (acc[cow.status] || 0) + 1;
      return acc;
    }, {} as Record<CattleStatus, number>);

    const byGender = cattle.reduce(
      (acc, cow) => {
        acc[cow.gender]++;
        return acc;
      },
      { male: 0, female: 0 }
    );

    const ages = cattle
      .filter(cow => cow.birthDate)
      .map(cow => cow.age)
      .filter(age => age !== null);

    const averageAge = ages.length > 0 
      ? ages.reduce((sum, age) => sum + age, 0) / ages.length 
      : 0;

    return {
      total,
      byStatus,
      byGender,
      averageAge: Math.round(averageAge * 100) / 100,
    };
  }

  private createFilteredQuery(filters: CattleFilterDto): SelectQueryBuilder<Cattle> {
    const queryBuilder = this.cattleRepository
      .createQueryBuilder('cattle')
      .leftJoinAndSelect('cattle.parentBull', 'parentBull')
      .leftJoinAndSelect('cattle.parentCow', 'parentCow')
      .where('cattle.deletedAt IS NULL');

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('cattle.status = :status', { status: filters.status });
    }

    if (filters.gender) {
      queryBuilder.andWhere('cattle.gender = :gender', { gender: filters.gender });
    }

    if (filters.breed) {
      queryBuilder.andWhere('LOWER(cattle.breed) LIKE LOWER(:breed)', {
        breed: `%${filters.breed}%`,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(cattle.name) LIKE LOWER(:search) OR LOWER(cattle.tagNumber) LIKE LOWER(:search))',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.bornAfter) {
      queryBuilder.andWhere('cattle.birthDate >= :bornAfter', {
        bornAfter: filters.bornAfter,
      });
    }

    if (filters.bornBefore) {
      queryBuilder.andWhere('cattle.birthDate <= :bornBefore', {
        bornBefore: filters.bornBefore,
      });
    }

    return queryBuilder;
  }

  private getSortField(sortBy?: string): string {
    const allowedFields = ['name', 'tagNumber', 'birthDate', 'status', 'createdAt'];
    return allowedFields.includes(sortBy || '') ? `cattle.${sortBy}` : 'cattle.createdAt';
  }
}