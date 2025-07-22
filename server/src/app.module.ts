import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, databaseConfig, jwtConfig, redisConfig } from './config';
import { validationSchema } from './config/env.validation';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CattleModule } from './modules/cattle/cattle.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([{
        ttl: configService.get<number>('app.throttle.ttl') || 60,
        limit: configService.get<number>('app.throttle.limit') || 10,
      }]),
      inject: [ConfigService],
    }),
    // Feature modules
    UsersModule,
    AuthModule,
    CattleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
