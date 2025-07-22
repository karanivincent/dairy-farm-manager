import { Test, TestingModule } from '@nestjs/testing';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { Production, MilkingSession, ProductionStatus } from './entities/production.entity';
import { CreateProductionDto, UpdateProductionDto, VerifyProductionDto, BulkProductionDto } from './dto';
import { User, UserRole } from '../users/entities/user.entity';

describe('ProductionController', () => {
  let controller: ProductionController;
  let service: ProductionService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.MANAGER,
    isActive: true,
  } as User;

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

  const mockProductionService = {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    verify: jest.fn(),
    remove: jest.fn(),
    getDailySummary: jest.fn(),
    getMonthlyReport: jest.fn(),
    getStatistics: jest.fn(),
    getCattleProductionHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        {
          provide: ProductionService,
          useValue: mockProductionService,
        },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
    service = module.get<ProductionService>(ProductionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a production record', async () => {
      const createDto: CreateProductionDto = {
        cattleId: 1,
        date: '2025-01-15',
        session: MilkingSession.MORNING,
        quantity: 15.5,
        fatContent: 3.8,
        proteinContent: 3.2,
        temperature: 4.2,
        notes: 'Good quality milk',
      };

      mockProductionService.create.mockResolvedValue(mockProduction);

      const result = await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
      expect(result).toEqual(mockProduction);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple production records', async () => {
      const bulkDto: BulkProductionDto = {
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

      const productions = [mockProduction, { ...mockProduction, id: 2, cattleId: 2 }];
      mockProductionService.bulkCreate.mockResolvedValue(productions);

      const result = await controller.bulkCreate(bulkDto, mockUser);

      expect(service.bulkCreate).toHaveBeenCalledWith(bulkDto, mockUser.id);
      expect(result).toEqual(productions);
    });
  });

  describe('findAll', () => {
    it('should return paginated production records', async () => {
      const filters = { page: 1, limit: 10 };
      const paginatedResult = {
        items: [mockProduction],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockProductionService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a production record by ID', async () => {
      mockProductionService.findOne.mockResolvedValue(mockProduction);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduction);
    });
  });

  describe('update', () => {
    it('should update a production record', async () => {
      const updateDto: UpdateProductionDto = {
        quantity: 16.0,
        notes: 'Updated notes',
      };

      const updatedProduction = { ...mockProduction, ...updateDto };
      mockProductionService.update.mockResolvedValue(updatedProduction);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedProduction);
    });
  });

  describe('verify', () => {
    it('should verify a production record', async () => {
      const verifyDto: VerifyProductionDto = {
        status: ProductionStatus.VERIFIED,
        notes: 'Verification notes',
      };

      const verifiedProduction = {
        ...mockProduction,
        status: ProductionStatus.VERIFIED,
        verifiedById: mockUser.id,
      };

      mockProductionService.verify.mockResolvedValue(verifiedProduction);

      const result = await controller.verify(1, verifyDto, mockUser);

      expect(service.verify).toHaveBeenCalledWith(1, verifyDto, mockUser.id);
      expect(result).toEqual(verifiedProduction);
    });
  });

  describe('remove', () => {
    it('should remove a production record', async () => {
      mockProductionService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe('getDailySummary', () => {
    it('should return daily production summary', async () => {
      const summary = {
        date: new Date('2025-01-15'),
        morning: 15.5,
        evening: 12.0,
        total: 27.5,
        cattleCount: 2,
        averagePerCow: 13.75,
      };

      mockProductionService.getDailySummary.mockResolvedValue(summary);

      const result = await controller.getDailySummary('2025-01-15');

      expect(service.getDailySummary).toHaveBeenCalledWith('2025-01-15');
      expect(result).toEqual(summary);
    });
  });

  describe('getMonthlyReport', () => {
    it('should return monthly production report', async () => {
      const report = [
        {
          date: new Date('2025-01-01'),
          morning: 100,
          evening: 80,
          total: 180,
          cattleCount: 10,
          averagePerCow: 18,
        },
      ];

      mockProductionService.getMonthlyReport.mockResolvedValue(report);

      const result = await controller.getMonthlyReport(2025, 1);

      expect(service.getMonthlyReport).toHaveBeenCalledWith(2025, 1);
      expect(result).toEqual(report);
    });
  });

  describe('getStatistics', () => {
    it('should return production statistics', async () => {
      const statistics = {
        totalProduction: 1000,
        averageDaily: 50,
        averagePerCow: 15,
        highestDaily: 75,
        lowestDaily: 25,
        totalCattle: 20,
        activeCattle: 18,
        qualityDistribution: {
          gradeA: 500,
          gradeB: 300,
          gradeC: 100,
          ungraded: 100,
        },
        statusDistribution: {
          recorded: 800,
          verified: 180,
          rejected: 20,
        },
      };

      mockProductionService.getStatistics.mockResolvedValue(statistics);

      const result = await controller.getStatistics();

      expect(service.getStatistics).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(statistics);
    });

    it('should return production statistics with date filters', async () => {
      const statistics = {
        totalProduction: 500,
        averageDaily: 50,
        averagePerCow: 15,
        highestDaily: 75,
        lowestDaily: 25,
        totalCattle: 20,
        activeCattle: 18,
        qualityDistribution: {
          gradeA: 250,
          gradeB: 150,
          gradeC: 50,
          ungraded: 50,
        },
        statusDistribution: {
          recorded: 400,
          verified: 90,
          rejected: 10,
        },
      };

      mockProductionService.getStatistics.mockResolvedValue(statistics);

      const result = await controller.getStatistics('2025-01-01', '2025-01-31');

      expect(service.getStatistics).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(result).toEqual(statistics);
    });
  });

  describe('getCattleProductionHistory', () => {
    it('should return cattle production history', async () => {
      const history = [mockProduction];
      mockProductionService.getCattleProductionHistory.mockResolvedValue(history);

      const result = await controller.getCattleProductionHistory(1);

      expect(service.getCattleProductionHistory).toHaveBeenCalledWith(1, undefined, undefined);
      expect(result).toEqual(history);
    });

    it('should return cattle production history with date filters', async () => {
      const history = [mockProduction];
      mockProductionService.getCattleProductionHistory.mockResolvedValue(history);

      const result = await controller.getCattleProductionHistory(1, '2025-01-01', '2025-01-31');

      expect(service.getCattleProductionHistory).toHaveBeenCalledWith(1, '2025-01-01', '2025-01-31');
      expect(result).toEqual(history);
    });
  });
});