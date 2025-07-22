import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Get configuration values
  const port = configService.get<number>('app.port') || 3000;
  const corsConfig = configService.get('app.cors');
  const swaggerConfig = configService.get('app.swagger');
  
  // Security
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  
  // Compression
  app.use(compression());
  
  // CORS
  app.enableCors(corsConfig);
  
  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('cattle', 'Cattle management')
    .addTag('production', 'Milk production tracking')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerConfig.path, app, document);
  
  await app.listen(port);
  
  console.log(`\n🚀 NestJS server is running!`);
  console.log(`📍 Local: http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/${swaggerConfig.path}\n`);
}
bootstrap();
