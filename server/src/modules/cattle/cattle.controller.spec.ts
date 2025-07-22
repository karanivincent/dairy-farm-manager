import { Test, TestingModule } from '@nestjs/testing';
import { CattleController } from './cattle.controller';
import { CattleService } from './cattle.service';
import { CreateCattleDto, UpdateCattleDto, CattleFilterDto } from './dto';
import { Cattle, Gender, CattleStatus } from './entities/cattle.entity';

describe('CattleController', () => {
  let controller: CattleController;
  let service: CattleService;

  const mockCattleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByTagNumber: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
    getOffspring: jest.fn(),
    getActiveMilkingCows: jest.fn(),
    getStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CattleController],
      providers: [
        {
          provide: CattleService,
          useValue: mockCattleService,
        },
      ],
    }).compile();

    controller = module.get<CattleController>(CattleController);
    service = module.get<CattleService>(CattleService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cattle', async () => {
      const createCattleDto: CreateCattleDto = {
        tagNumber: 'COW-001',
        name: 'Bella',
        breed: 'Holstein',
        birthDate: '2020-05-15',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        weight: 650.5,
      };

      const expectedResult = {
        id: 1,
        ...createCattleDto,
        birthDate: new Date('2020-05-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCattleService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCattleDto);

      expect(service.create).toHaveBeenCalledWith(createCattleDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated cattle list', async () => {
      const filters: CattleFilterDto = {
        page: 1,
        limit: 20,
        status: CattleStatus.ACTIVE,
      };

      const expectedResult = {
        items: [
          { id: 1, name: 'Bella', status: CattleStatus.ACTIVE },
          { id: 2, name: 'Daisy', status: CattleStatus.ACTIVE },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockCattleService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getStatistics', () => {
    it('should return cattle statistics', async () => {
      const expectedStats = {
        total: 10,
        byStatus: {
          [CattleStatus.ACTIVE]: 8,
          [CattleStatus.PREGNANT]: 2,
        },
        byGender: {
          male: 3,
          female: 7,
        },
        averageAge: 4.5,
      };

      mockCattleService.getStatistics.mockResolvedValue(expectedStats);

      const result = await controller.getStatistics();

      expect(service.getStatistics).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getActiveMilkingCows', () => {
    it('should return active milking cows', async () => {
      const expectedCows = [
        { id: 1, name: 'Bella', gender: Gender.FEMALE, status: CattleStatus.ACTIVE },
        { id: 2, name: 'Daisy', gender: Gender.FEMALE, status: CattleStatus.ACTIVE },
      ];

      mockCattleService.getActiveMilkingCows.mockResolvedValue(expectedCows);

      const result = await controller.getActiveMilkingCows();

      expect(service.getActiveMilkingCows).toHaveBeenCalled();
      expect(result).toEqual(expectedCows);
    });
  });

  describe('findByTagNumber', () => {
    it('should return cattle by tag number', async () => {
      const tagNumber = 'COW-001';
      const expectedCattle = {
        id: 1,
        tagNumber: 'COW-001',
        name: 'Bella',
        status: CattleStatus.ACTIVE,
      };

      mockCattleService.findByTagNumber.mockResolvedValue(expectedCattle);

      const result = await controller.findByTagNumber(tagNumber);

      expect(service.findByTagNumber).toHaveBeenCalledWith(tagNumber);
      expect(result).toEqual(expectedCattle);
    });
  });

  describe('findOne', () => {
    it('should return cattle by id', async () => {
      const id = 1;
      const expectedCattle = {
        id: 1,
        tagNumber: 'COW-001',
        name: 'Bella',
        status: CattleStatus.ACTIVE,
        parentBull: null,
        parentCow: null,
        offspringAsBull: [],
        offspringAsCow: [],
      };

      mockCattleService.findOne.mockResolvedValue(expectedCattle);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedCattle);
    });
  });

  describe('getOffspring', () => {
    it('should return offspring of cattle', async () => {
      const id = 1;
      const expectedOffspring = [
        { id: 2, name: 'Child1', parentBullId: 1 },
        { id: 3, name: 'Child2', parentCowId: 1 },
      ];

      mockCattleService.getOffspring.mockResolvedValue(expectedOffspring);

      const result = await controller.getOffspring(id);

      expect(service.getOffspring).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedOffspring);
    });
  });

  describe('update', () => {
    it('should update cattle', async () => {
      const id = 1;
      const updateCattleDto: UpdateCattleDto = {
        name: 'Updated Bella',
        weight: 700,
      };

      const expectedResult = {
        id: 1,
        tagNumber: 'COW-001',
        name: 'Updated Bella',
        weight: 700,
        status: CattleStatus.ACTIVE,
      };

      mockCattleService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateCattleDto);

      expect(service.update).toHaveBeenCalledWith(id, updateCattleDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateStatus', () => {
    it('should update cattle status', async () => {
      const id = 1;
      const newStatus = CattleStatus.PREGNANT;

      const expectedResult = {
        id: 1,
        tagNumber: 'COW-001',
        name: 'Bella',
        status: CattleStatus.PREGNANT,
      };

      mockCattleService.updateStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateStatus(id, newStatus);

      expect(service.updateStatus).toHaveBeenCalledWith(id, newStatus);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove cattle', async () => {
      const id = 1;

      mockCattleService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});