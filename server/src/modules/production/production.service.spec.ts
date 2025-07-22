import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import {
  Production,
  MilkingSession,
  ProductionStatus,
} from './entities/production.entity';
import { CattleService } from '../cattle/cattle.service';
import {
  CreateProductionDto,
  UpdateProductionDto,
  VerifyProductionDto,
} from './dto';

describe('ProductionService', () => {
  let service: ProductionService;
  let repository: Repository<Production>;
  let cattleService: CattleService;

  const mockProduction = {
    id: 1,
    cattleId: 1,
    date: new Date('2025-01-15'),
    session: MilkingSession.MORNING,
    quantity: 15.5,
    fatContent: 3.8,
    proteinContent: 3.2,
    temperature: 4.2,
    qualityGrade: 'A',
    status: ProductionStatus.RECORDED,
    recordedById: 1,
    verifiedById: undefined,
    verifiedAt: undefined,
    notes: 'Good quality milk',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  const mockCattle = {
    id: 1,
    name: 'Bessie',
    tagNumber: 'COW001',
    canMilk: true,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCattleService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: getRepositoryToken(Production),
          useValue: mockRepository,
        },
        {
          provide: CattleService,
          useValue: mockCattleService,
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    repository = module.get<Repository<Production>>(getRepositoryToken(Production));
    cattleService = module.get<CattleService>(CattleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductionDto: CreateProductionDto = {
      cattleId: 1,
      date: '2025-01-15',
      session: MilkingSession.MORNING,
      quantity: 15.5,
      fatContent: 3.8,
      proteinContent: 3.2,
      temperature: 4.2,
      notes: 'Good quality milk',
    };

    it('should create a production record successfully', async () => {
      mockCattleService.findOne.mockResolvedValue(mockCattle);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockProduction);
      mockRepository.save.mockResolvedValue(mockProduction);

      const result = await service.create(createProductionDto, 1);

      expect(cattleService.findOne).toHaveBeenCalledWith(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          cattleId: 1,
          date: new Date('2025-01-15'),
          session: MilkingSession.MORNING,
        },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...createProductionDto,
        date: new Date('2025-01-15'),
        recordedById: 1,
      });
      expect(repository.save).toHaveBeenCalledWith(mockProduction);
      expect(result).toEqual(mockProduction);
    });

    it('should throw BadRequestException if cattle cannot produce milk', async () => {
      const nonMilkingCattle = { ...mockCattle, canMilk: false };
      mockCattleService.findOne.mockResolvedValue(nonMilkingCattle);

      await expect(service.create(createProductionDto, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(cattleService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw ConflictException if production record already exists', async () => {
      mockCattleService.findOne.mockResolvedValue(mockCattle);
      mockRepository.findOne.mockResolvedValue(mockProduction);

      await expect(service.create(createProductionDto, 1)).rejects.toThrow(
        ConflictException,
      );
      expect(cattleService.findOne).toHaveBeenCalledWith(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          cattleId: 1,
          date: new Date('2025-01-15'),
          session: MilkingSession.MORNING,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return production record if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduction);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cattle', 'recordedBy', 'verifiedBy'],
      });
      expect(result).toEqual(mockProduction);
    });

    it('should throw NotFoundException if production record not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cattle', 'recordedBy', 'verifiedBy'],
      });
    });
  });

  describe('update', () => {
    const updateProductionDto: UpdateProductionDto = {
      quantity: 16.0,
      notes: 'Updated notes',
    };

    it('should update production record successfully', async () => {
      const updatedProduction = { ...mockProduction, ...updateProductionDto };
      mockRepository.save.mockResolvedValue(updatedProduction);

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduction as Production);

      const result = await service.update(1, updateProductionDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedProduction);
    });

    it('should throw BadRequestException if production is not in RECORDED status', async () => {
      const verifiedProduction = {
        ...mockProduction,
        status: ProductionStatus.VERIFIED,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(verifiedProduction as Production);

      await expect(service.update(1, updateProductionDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('verify', () => {
    const verifyDto: VerifyProductionDto = {
      status: ProductionStatus.VERIFIED,
      notes: 'Verification notes',
    };

    it('should verify production record successfully', async () => {
      const verifiedProduction = {
        ...mockProduction,
        status: ProductionStatus.VERIFIED,
        verifiedById: 2,
        verifiedAt: expect.any(Date),
        notes: 'Good quality milk\n\nVerification: Verification notes',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduction as Production);
      mockRepository.save.mockResolvedValue(verifiedProduction);

      const result = await service.verify(1, verifyDto, 2);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalled();
      expect(result.status).toBe(ProductionStatus.VERIFIED);
      expect(result.verifiedById).toBe(2);
    });

    it('should throw BadRequestException if production is already verified', async () => {
      const verifiedProduction = {
        ...mockProduction,
        status: ProductionStatus.VERIFIED,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(verifiedProduction as Production);

      await expect(service.verify(1, verifyDto, 2)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should soft delete production record successfully', async () => {
      const recordedProduction = { ...mockProduction, status: ProductionStatus.RECORDED };
      jest.spyOn(service, 'findOne').mockResolvedValue(recordedProduction as Production);
      mockRepository.save.mockResolvedValue({
        ...recordedProduction,
        deletedAt: new Date(),
      });

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if production is not in RECORDED status', async () => {
      const verifiedProduction = {
        ...mockProduction,
        status: ProductionStatus.VERIFIED,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(verifiedProduction as Production);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getDailySummary', () => {
    it('should return daily production summary', async () => {
      const productions = [
        {
          ...mockProduction,
          session: MilkingSession.MORNING,
          quantity: 15.5,
          cattleId: 1,
        },
        {
          ...mockProduction,
          session: MilkingSession.EVENING,
          quantity: 12.0,
          cattleId: 1,
        },
        {
          ...mockProduction,
          session: MilkingSession.MORNING,
          quantity: 18.0,
          cattleId: 2,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(productions),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDailySummary('2025-01-15');

      expect(result).toEqual({
        date: new Date('2025-01-15'),
        morning: 33.5,
        evening: 12.0,
        total: 45.5,
        cattleCount: 2,
        averagePerCow: 22.75,
      });
    });
  });

  describe('getStatistics', () => {
    it('should return production statistics', async () => {
      const productions = [
        {
          ...mockProduction,
          quantity: 15.5,
          status: ProductionStatus.RECORDED,
          qualityGrade: 'A',
          cattleId: 1,
          date: new Date('2025-01-15'),
        },
        {
          ...mockProduction,
          quantity: 12.0,
          status: ProductionStatus.VERIFIED,
          qualityGrade: 'B',
          cattleId: 2,
          date: new Date('2025-01-15'),
        },
        {
          ...mockProduction,
          quantity: 18.0,
          status: ProductionStatus.RECORDED,
          qualityGrade: 'A',
          cattleId: 1,
          date: new Date('2025-01-16'),
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(productions),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStatistics();

      expect(result.totalProduction).toBe(45.5);
      expect(result.totalCattle).toBe(2);
      expect(result.qualityDistribution.gradeA).toBe(2);
      expect(result.qualityDistribution.gradeB).toBe(1);
      expect(result.statusDistribution.recorded).toBe(2);
      expect(result.statusDistribution.verified).toBe(1);
    });

    it('should return empty statistics when no productions found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStatistics();

      expect(result.totalProduction).toBe(0);
      expect(result.totalCattle).toBe(0);
      expect(result.qualityDistribution.gradeA).toBe(0);
      expect(result.statusDistribution.recorded).toBe(0);
    });
  });

  describe('getCattleProductionHistory', () => {
    it('should return cattle production history', async () => {
      const productions = [mockProduction];
      mockCattleService.findOne.mockResolvedValue(mockCattle);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(productions),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getCattleProductionHistory(1);

      expect(cattleService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(productions);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple production records', async () => {
      const bulkDto = {
        productions: [
          {
            cattleId: 1,
            date: '2025-01-15',
            session: MilkingSession.MORNING,
            quantity: 15.5,
          },
          {
            cattleId: 2,
            date: '2025-01-15',
            session: MilkingSession.MORNING,
            quantity: 18.0,
          },
        ],
      };

      jest.spyOn(service, 'create')
        .mockResolvedValueOnce(mockProduction as Production)
        .mockResolvedValueOnce({ ...mockProduction, id: 2, cattleId: 2 } as Production);

      const result = await service.bulkCreate(bulkDto, 1);

      expect(service.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should handle partial failures in bulk create', async () => {
      const bulkDto = {
        productions: [
          {
            cattleId: 1,
            date: '2025-01-15',
            session: MilkingSession.MORNING,
            quantity: 15.5,
          },
          {
            cattleId: 999,
            date: '2025-01-15',
            session: MilkingSession.MORNING,
            quantity: 18.0,
          },
        ],
      };

      jest.spyOn(service, 'create')
        .mockResolvedValueOnce(mockProduction as Production)
        .mockRejectedValueOnce(new Error('Cattle not found'));

      const result = await service.bulkCreate(bulkDto, 1);

      expect(service.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
    });

    it('should throw BadRequestException if all records fail', async () => {
      const bulkDto = {
        productions: [
          {
            cattleId: 999,
            date: '2025-01-15',
            session: MilkingSession.MORNING,
            quantity: 15.5,
          },
        ],
      };

      jest.spyOn(service, 'create')
        .mockRejectedValue(new Error('Cattle not found'));

      await expect(service.bulkCreate(bulkDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});