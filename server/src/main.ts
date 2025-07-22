import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  
  await app.listen(port);
  
  console.log(`\n🚀 NestJS server is running!`);
  console.log(`📍 Local: http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/api\n`);
}
bootstrap();
