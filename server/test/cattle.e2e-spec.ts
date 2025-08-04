import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { CattleModule } from '../src/modules/cattle/cattle.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { Cattle, Gender, CattleStatus } from '../src/modules/cattle/entities/cattle.entity';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { CreateCattleDto } from '../src/modules/cattle/dto';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, jwtConfig } from '../src/config';

describe('Cattle (e2e)', () => {
  let app: INestApplication;
  let cattleRepository: Repository<Cattle>;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let authToken: string;
  let adminUser: User;

  const testDbConfig = {
    type: 'postgres' as const,
    host: process.env.TEST_DATABASE_HOST || 'localhost',
    port: parseInt(process.env.TEST_DATABASE_PORT || '5437', 10),
    username: process.env.TEST_DATABASE_USERNAME || 'farm_user',
    password: process.env.TEST_DATABASE_PASSWORD || 'farm_pass',
    database: process.env.TEST_DATABASE_NAME || 'farm_db_test',
    entities: [Cattle, User],
    synchronize: true,
    dropSchema: true,
    logging: false,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, databaseConfig, jwtConfig],
        }),
        TypeOrmModule.forRoot(testDbConfig),
        UsersModule,
        AuthModule,
        CattleModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    cattleRepository = moduleFixture.get<Repository<Cattle>>(getRepositoryToken(Cattle));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Create test admin user
    adminUser = userRepository.create({
      email: 'admin@test.com',
      username: 'admin',
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    await userRepository.save(adminUser);

    // Generate auth token
    authToken = jwtService.sign({
      sub: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up cattle data before each test
    await cattleRepository.clear();
  });

  describe('/cattle (POST)', () => {
    const createCattleDto: CreateCattleDto = {
      tagNumber: 'COW-001',
      name: 'Bella',
      breed: 'Holstein',
      birthDate: '2020-05-15',
      gender: Gender.FEMALE,
      status: CattleStatus.ACTIVE,
      weight: 650.5,
    };

    it('should create a cattle with valid data', () => {
      return request(app.getHttpServer())
        .post('/cattle')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCattleDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            tagNumber: createCattleDto.tagNumber,
            name: createCattleDto.name,
            breed: createCattleDto.breed,
            gender: createCattleDto.gender,
            status: createCattleDto.status,
            weight: createCattleDto.weight,
          });
          expect(res.body.id).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/cattle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          name: 'Invalid Cattle',
        })
        .expect(400);
    });

    it('should return 409 for duplicate tag number', async () => {
      // Create first cattle
      await request(app.getHttpServer())
        .post('/cattle')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCattleDto)
        .expect(201);

      // Try to create cattle with same tag number
      return request(app.getHttpServer())
        .post('/cattle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...createCattleDto,
          name: 'Different Name',
        })
        .expect(409);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/cattle')
        .send(createCattleDto)
        .expect(401);
    });
  });

  describe('/cattle (GET)', () => {
    beforeEach(async () => {
      // Create test cattle
      const cattle1 = cattleRepository.create({
        tagNumber: 'COW-001',
        name: 'Bella',
        breed: 'Holstein',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        birthDate: new Date('2020-05-15'),
      });

      const cattle2 = cattleRepository.create({
        tagNumber: 'COW-002',
        name: 'Daisy',
        breed: 'Jersey',
        gender: Gender.FEMALE,
        status: CattleStatus.PREGNANT,
        birthDate: new Date('2019-03-20'),
      });

      const cattle3 = cattleRepository.create({
        tagNumber: 'BULL-001',
        name: 'Thunder',
        breed: 'Holstein',
        gender: Gender.MALE,
        status: CattleStatus.ACTIVE,
        birthDate: new Date('2018-01-10'),
      });

      await cattleRepository.save([cattle1, cattle2, cattle3]);
    });

    it('should return paginated cattle list', () => {
      return request(app.getHttpServer())
        .get('/cattle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            items: expect.any(Array),
            total: 3,
            page: 1,
            limit: 20,
            totalPages: 1,
          });
          expect(res.body.items).toHaveLength(3);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/cattle?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBe(2);
          expect(res.body.items.every((cattle: any) => cattle.status === 'active')).toBe(true);
        });
    });

    it('should filter by gender', () => {
      return request(app.getHttpServer())
        .get('/cattle?gender=male')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBe(1);
          expect(res.body.items[0].gender).toBe('male');
        });
    });

    it('should search by name', () => {
      return request(app.getHttpServer())
        .get('/cattle?search=Bella')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBe(1);
          expect(res.body.items[0].name).toBe('Bella');
        });
    });

    it('should apply pagination', () => {
      return request(app.getHttpServer())
        .get('/cattle?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(2);
          expect(res.body.totalPages).toBe(2);
        });
    });
  });

  describe('/cattle/statistics (GET)', () => {
    beforeEach(async () => {
      const cattle = [
        cattleRepository.create({
          tagNumber: 'COW-001',
          name: 'Bella',
          gender: Gender.FEMALE,
          status: CattleStatus.ACTIVE,
          birthDate: new Date('2020-01-01'),
        }),
        cattleRepository.create({
          tagNumber: 'COW-002',
          name: 'Daisy',
          gender: Gender.FEMALE,
          status: CattleStatus.PREGNANT,
          birthDate: new Date('2019-01-01'),
        }),
        cattleRepository.create({
          tagNumber: 'BULL-001',
          name: 'Thunder',
          gender: Gender.MALE,
          status: CattleStatus.ACTIVE,
          birthDate: new Date('2018-01-01'),
        }),
      ];

      await cattleRepository.save(cattle);
    });

    it('should return cattle statistics', () => {
      return request(app.getHttpServer())
        .get('/cattle/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            total: 3,
            byStatus: {
              active: 2,
              pregnant: 1,
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

  describe('/cattle/milking-cows (GET)', () => {
    beforeEach(async () => {
      const cattle = [
        cattleRepository.create({
          tagNumber: 'COW-001',
          name: 'Bella',
          gender: Gender.FEMALE,
          status: CattleStatus.ACTIVE,
          birthDate: new Date('2020-01-01'), // Adult cow
        }),
        cattleRepository.create({
          tagNumber: 'COW-002',
          name: 'Young Daisy',
          gender: Gender.FEMALE,
          status: CattleStatus.ACTIVE,
          birthDate: new Date('2023-01-01'), // Young cow
        }),
        cattleRepository.create({
          tagNumber: 'BULL-001',
          name: 'Thunder',
          gender: Gender.MALE,
          status: CattleStatus.ACTIVE,
          birthDate: new Date('2018-01-01'), // Male
        }),
      ];

      await cattleRepository.save(cattle);
    });

    it('should return only adult female active cattle', () => {
      return request(app.getHttpServer())
        .get('/cattle/milking-cows')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe('Bella');
          expect(res.body[0].gender).toBe('female');
          expect(res.body[0].status).toBe('active');
        });
    });
  });

  describe('/cattle/:id (GET)', () => {
    let cattleId: number;

    beforeEach(async () => {
      const cattle = cattleRepository.create({
        tagNumber: 'COW-001',
        name: 'Bella',
        breed: 'Holstein',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        birthDate: new Date('2020-05-15'),
      });

      const savedCattle = await cattleRepository.save(cattle);
      cattleId = savedCattle.id;
    });

    it('should return cattle by id', () => {
      return request(app.getHttpServer())
        .get(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: cattleId,
            tagNumber: 'COW-001',
            name: 'Bella',
            breed: 'Holstein',
            gender: 'female',
            status: 'active',
          });
        });
    });

    it('should return 404 for non-existent cattle', () => {
      return request(app.getHttpServer())
        .get('/cattle/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/cattle/tag/:tagNumber (GET)', () => {
    beforeEach(async () => {
      const cattle = cattleRepository.create({
        tagNumber: 'COW-001',
        name: 'Bella',
        breed: 'Holstein',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        birthDate: new Date('2020-05-15'),
      });

      await cattleRepository.save(cattle);
    });

    it('should return cattle by tag number', () => {
      return request(app.getHttpServer())
        .get('/cattle/tag/COW-001')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            tagNumber: 'COW-001',
            name: 'Bella',
          });
        });
    });

    it('should return 404 for non-existent tag number', () => {
      return request(app.getHttpServer())
        .get('/cattle/tag/INVALID-TAG')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/cattle/:id (PATCH)', () => {
    let cattleId: number;

    beforeEach(async () => {
      const cattle = cattleRepository.create({
        tagNumber: 'COW-001',
        name: 'Bella',
        breed: 'Holstein',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        weight: 650,
      });

      const savedCattle = await cattleRepository.save(cattle);
      cattleId = savedCattle.id;
    });

    it('should update cattle', () => {
      const updateData = {
        name: 'Updated Bella',
        weight: 700,
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: cattleId,
            name: 'Updated Bella',
            weight: 700,
          });
        });
    });

    it('should return 404 for non-existent cattle', () => {
      return request(app.getHttpServer())
        .patch('/cattle/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('/cattle/:id (PATCH) - Enhanced Edit Tests', () => {
    let cattleId: number;
    let parentBullId: number;
    let parentCowId: number;

    beforeEach(async () => {
      // Create parent cattle
      const parentBull = cattleRepository.create({
        tagNumber: 'BULL-001',
        name: 'Thunder',
        gender: Gender.MALE,
        status: CattleStatus.ACTIVE,
      });
      const savedBull = await cattleRepository.save(parentBull);
      parentBullId = savedBull.id;

      const parentCow = cattleRepository.create({
        tagNumber: 'COW-002',
        name: 'Daisy',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
      });
      const savedCow = await cattleRepository.save(parentCow);
      parentCowId = savedCow.id;

      // Create test cattle with all fields
      const cattle = cattleRepository.create({
        tagNumber: 'COW-001',
        name: 'Bella',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        weight: 650,
        breed: 'Holstein',
        birthDate: new Date('2022-01-15'),
        parentBullId: parentBullId,
        parentCowId: parentCowId,
        metadata: {
          birthWeight: 35.5,
          birthType: 'single',
          healthNotes: 'Healthy calf',
        },
      });

      const savedCattle = await cattleRepository.save(cattle);
      cattleId = savedCattle.id;
    });

    it('should update cattle with all fields including metadata', () => {
      const updateData = {
        name: 'Updated Bella',
        tagNumber: 'COW-001-UPDATED',
        weight: 700,
        breed: 'Jersey',
        birthDate: '2022-01-20',
        metadata: {
          birthWeight: 36.0,
          birthType: 'twin',
          healthNotes: 'Updated health notes',
        },
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: cattleId,
            name: 'Updated Bella',
            tagNumber: 'COW-001-UPDATED',
            weight: 700,
            breed: 'Jersey',
            metadata: expect.objectContaining({
              birthWeight: 36.0,
              birthType: 'twin',
              healthNotes: 'Updated health notes',
            }),
          });
        });
    });

    it('should handle optional fields with empty strings by converting to null/undefined', () => {
      const updateData = {
        name: 'Bella Updated',
        breed: '',
        birthDate: '',
        parentBullId: '',
        parentCowId: '',
        metadata: {
          birthWeight: '',
          birthType: '',
          healthNotes: '',
        },
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Bella Updated');
          // Empty strings should be converted to null/undefined
          expect(res.body.breed).toBeNull();
          expect(res.body.birthDate).toBeNull();
          expect(res.body.parentBullId).toBeNull();
          expect(res.body.parentCowId).toBeNull();
        });
    });

    it('should handle partial updates without affecting existing fields', () => {
      const updateData = {
        name: 'Partially Updated Bella',
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: cattleId,
            name: 'Partially Updated Bella',
            tagNumber: 'COW-001', // Should remain unchanged
            gender: Gender.FEMALE, // Should remain unchanged
            breed: 'Holstein', // Should remain unchanged
            parentBullId: parentBullId, // Should remain unchanged
            parentCowId: parentCowId, // Should remain unchanged
          });
          expect(res.body.metadata).toMatchObject({
            birthWeight: 35.5,
            birthType: 'single',
            healthNotes: 'Healthy calf',
          });
        });
    });

    it('should update parent relationships', () => {
      const updateData = {
        parentBullId: null,
        parentCowId: null,
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.parentBullId).toBeNull();
          expect(res.body.parentCowId).toBeNull();
        });
    });

    it('should validate numeric fields in metadata', () => {
      const updateData = {
        metadata: {
          birthWeight: 'not-a-number',
        },
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400); // Bad Request due to validation
    });

    it('should allow updating with same tag number', () => {
      const updateData = {
        tagNumber: 'COW-001', // Same as current
        name: 'Same Tag Update',
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.tagNumber).toBe('COW-001');
          expect(res.body.name).toBe('Same Tag Update');
        });
    });

    it('should reject duplicate tag number from another cattle', async () => {
      // Create another cattle
      const anotherCattle = cattleRepository.create({
        tagNumber: 'COW-003',
        name: 'Another Cow',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
      });
      await cattleRepository.save(anotherCattle);

      const updateData = {
        tagNumber: 'COW-003', // Try to use existing tag from another cattle
      };

      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409); // Conflict
    });
  });

  describe('/cattle/:id/status (PATCH)', () => {
    let cattleId: number;

    beforeEach(async () => {
      const cattle = cattleRepository.create({
        tagNumber: 'COW-001',
        name: 'Bella',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
      });

      const savedCattle = await cattleRepository.save(cattle);
      cattleId = savedCattle.id;
    });

    it('should update cattle status', () => {
      return request(app.getHttpServer())
        .patch(`/cattle/${cattleId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: CattleStatus.PREGNANT })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('pregnant');
        });
    });
  });

  describe('/cattle/:id (DELETE)', () => {
    let cattleId: number;

    beforeEach(async () => {
      const cattle = cattleRepository.create({
        tagNumber: 'COW-001',
        name: 'Bella',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
      });

      const savedCattle = await cattleRepository.save(cattle);
      cattleId = savedCattle.id;
    });

    it('should soft delete cattle', async () => {
      await request(app.getHttpServer())
        .delete(`/cattle/${cattleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify cattle is soft deleted
      const deletedCattle = await cattleRepository.findOne({
        where: { id: cattleId },
        withDeleted: true,
      });

      expect(deletedCattle.deletedAt).toBeDefined();
    });

    it('should return 404 for non-existent cattle', () => {
      return request(app.getHttpServer())
        .delete('/cattle/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});