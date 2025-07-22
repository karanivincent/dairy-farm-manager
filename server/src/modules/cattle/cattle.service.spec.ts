import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CattleService } from './cattle.service';
import { Cattle, Gender, CattleStatus } from './entities/cattle.entity';
import { CreateCattleDto, UpdateCattleDto, CattleFilterDto } from './dto';

describe('CattleService', () => {
  let service: CattleService;
  let repository: Repository<Cattle>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CattleService,
        {
          provide: getRepositoryToken(Cattle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CattleService>(CattleService);
    repository = module.get<Repository<Cattle>>(getRepositoryToken(Cattle));

    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default query builder mock
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCattleDto: CreateCattleDto = {
      tagNumber: 'COW-001',
      name: 'Bella',
      breed: 'Holstein',
      birthDate: '2020-05-15',
      gender: Gender.FEMALE,
      status: CattleStatus.ACTIVE,
      weight: 650.5,
    };

    it('should create a cattle successfully', async () => {
      const mockCattle = {
        id: 1,
        ...createCattleDto,
        birthDate: new Date('2020-05-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null); // No existing cattle
      mockRepository.create.mockReturnValue(mockCattle);
      mockRepository.save.mockResolvedValue(mockCattle);

      const result = await service.create(createCattleDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tagNumber: createCattleDto.tagNumber },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createCattleDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCattle);
      expect(result).toEqual(mockCattle);
    });

    it('should throw ConflictException when tag number already exists', async () => {
      const existingCattle = { id: 1, tagNumber: 'COW-001' };
      mockRepository.findOne.mockResolvedValue(existingCattle);

      await expect(service.create(createCattleDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tagNumber: createCattleDto.tagNumber },
      });
    });

    it('should validate parent bull exists and is male', async () => {
      const dtoWithParents = {
        ...createCattleDto,
        parentBullId: 1,
      };

      const mockBull = { id: 1, gender: Gender.MALE } as Cattle;
      
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No existing cattle with tag
        .mockResolvedValueOnce(mockBull); // Parent bull exists and is male

      mockRepository.create.mockReturnValue(dtoWithParents as any);
      mockRepository.save.mockResolvedValue(dtoWithParents as any);

      await service.create(dtoWithParents);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw BadRequestException when parent bull does not exist', async () => {
      const dtoWithParents = {
        ...createCattleDto,
        parentBullId: 999,
      };

      mockRepository.findOne
        .mockResolvedValueOnce(null) // No existing cattle with tag
        .mockResolvedValueOnce(null); // Parent bull does not exist

      await expect(service.create(dtoWithParents)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when parent bull is not male', async () => {
      const dtoWithParents = {
        ...createCattleDto,
        parentBullId: 1,
      };

      const mockFemaleBull = { id: 1, gender: Gender.FEMALE } as Cattle;
      
      mockRepository.findOne
        .mockResolvedValueOnce(null) // No existing cattle with tag
        .mockResolvedValueOnce(mockFemaleBull); // Parent "bull" is female

      await expect(service.create(dtoWithParents)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated cattle list', async () => {
      const filters: CattleFilterDto = {
        page: 1,
        limit: 20,
        status: CattleStatus.ACTIVE,
      };

      const mockCattle = [
        { id: 1, name: 'Bella', status: CattleStatus.ACTIVE },
        { id: 2, name: 'Daisy', status: CattleStatus.ACTIVE },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockCattle, 2]);

      const result = await service.findAll(filters);

      expect(result).toEqual({
        items: mockCattle,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('cattle');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cattle.status = :status', {
        status: CattleStatus.ACTIVE,
      });
    });

    it('should apply default pagination when not provided', async () => {
      const filters: CattleFilterDto = {};
      const mockCattle: Cattle[] = [];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockCattle, 0]);

      const result = await service.findAll(filters);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should apply search filter correctly', async () => {
      const filters: CattleFilterDto = {
        search: 'Bella',
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[] as Cattle[], 0]);

      await service.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(cattle.name) LIKE LOWER(:search) OR LOWER(cattle.tagNumber) LIKE LOWER(:search))',
        { search: '%Bella%' }
      );
    });
  });

  describe('findOne', () => {
    it('should return cattle by id', async () => {
      const mockCattle = {
        id: 1,
        name: 'Bella',
        tagNumber: 'COW-001',
      };

      mockRepository.findOne.mockResolvedValue(mockCattle);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCattle);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['parentBull', 'parentCow', 'offspringAsBull', 'offspringAsCow'],
      });
    });

    it('should throw NotFoundException when cattle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTagNumber', () => {
    it('should return cattle by tag number', async () => {
      const mockCattle = {
        id: 1,
        name: 'Bella',
        tagNumber: 'COW-001',
      };

      mockRepository.findOne.mockResolvedValue(mockCattle);

      const result = await service.findByTagNumber('COW-001');

      expect(result).toEqual(mockCattle);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tagNumber: 'COW-001' },
        relations: ['parentBull', 'parentCow'],
      });
    });

    it('should throw NotFoundException when cattle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByTagNumber('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCattleDto = {
      name: 'Updated Name',
      weight: 700,
    };

    it('should update cattle successfully', async () => {
      const existingCattle = {
        id: 1,
        name: 'Bella',
        tagNumber: 'COW-001',
        weight: 650,
      };

      const updatedCattle = {
        ...existingCattle,
        ...updateDto,
      };

      // Mock findOne for the initial cattle lookup
      mockRepository.findOne.mockResolvedValue(existingCattle);
      mockRepository.save.mockResolvedValue(updatedCattle);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedCattle);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingCattle,
        ...updateDto,
      });
    });

    it('should throw ConflictException when updating to existing tag number', async () => {
      const existingCattle = {
        id: 1,
        tagNumber: 'COW-001',
      };

      const updateWithTagDto = {
        tagNumber: 'COW-002',
      };

      const conflictingCattle = {
        id: 2,
        tagNumber: 'COW-002',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(existingCattle) // Initial cattle lookup
        .mockResolvedValueOnce(conflictingCattle); // Tag number conflict check

      await expect(service.update(1, updateWithTagDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update cattle status', async () => {
      const existingCattle = {
        id: 1,
        status: CattleStatus.ACTIVE,
      };

      const updatedCattle = {
        ...existingCattle,
        status: CattleStatus.PREGNANT,
      };

      mockRepository.findOne.mockResolvedValue(existingCattle);
      mockRepository.save.mockResolvedValue(updatedCattle);

      const result = await service.updateStatus(1, CattleStatus.PREGNANT);

      expect(result.status).toBe(CattleStatus.PREGNANT);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingCattle,
        status: CattleStatus.PREGNANT,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete cattle', async () => {
      const existingCattle = {
        id: 1,
        name: 'Bella',
      };

      mockRepository.findOne.mockResolvedValue(existingCattle);
      mockRepository.save.mockResolvedValue({
        ...existingCattle,
        deletedAt: new Date(),
      });

      await service.remove(1);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingCattle,
        deletedAt: expect.any(Date),
      });
    });
  });

  describe('getOffspring', () => {
    it('should return offspring of cattle', async () => {
      const parentCattle = { id: 1, name: 'Parent' };
      const offspring = [
        { id: 2, name: 'Child1', parentBullId: 1 },
        { id: 3, name: 'Child2', parentCowId: 1 },
      ];

      mockRepository.findOne.mockResolvedValue(parentCattle);
      mockRepository.find.mockResolvedValue(offspring);

      const result = await service.getOffspring(1);

      expect(result).toEqual(offspring);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: [
          { parentBullId: 1 },
          { parentCowId: 1 },
        ],
        relations: ['parentBull', 'parentCow'],
      });
    });
  });

  describe('getActiveMilkingCows', () => {
    it('should return active milking cows', async () => {
      const milkingCows = [
        { id: 1, name: 'Bella', gender: Gender.FEMALE, status: CattleStatus.ACTIVE },
        { id: 2, name: 'Daisy', gender: Gender.FEMALE, status: CattleStatus.ACTIVE },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(milkingCows);

      const result = await service.getActiveMilkingCows();

      expect(result).toEqual(milkingCows);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('cattle.gender = :gender', {
        gender: 'female',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cattle.status = :status', {
        status: CattleStatus.ACTIVE,
      });
    });
  });

  describe('getStatistics', () => {
    it('should return cattle statistics', async () => {
      const mockCattle = [
        {
          status: CattleStatus.ACTIVE,
          gender: Gender.FEMALE,
          birthDate: new Date('2020-01-01'),
        },
        {
          status: CattleStatus.PREGNANT,
          gender: Gender.FEMALE,
          birthDate: new Date('2019-01-01'),
        },
        {
          status: CattleStatus.ACTIVE,
          gender: Gender.MALE,
          birthDate: new Date('2018-01-01'),
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(3);
      mockQueryBuilder.getMany.mockResolvedValue(mockCattle);

      const result = await service.getStatistics();

      expect(result).toEqual({
        total: 3,
        byStatus: {
          [CattleStatus.ACTIVE]: 2,
          [CattleStatus.PREGNANT]: 1,
        },
        byGender: {
          male: 1,
          female: 2,
        },
        averageAge: expect.any(Number),
      });
    });
  });
});