import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'farm_user',
  password: process.env.DATABASE_PASSWORD || 'farm_pass',
  database: process.env.DATABASE_NAME || 'farm_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
  retryAttempts: 3,
  retryDelay: 3000,
  extra: {
    max: 30, // connection pool size
    connectionTimeoutMillis: 10000,
  },
}));