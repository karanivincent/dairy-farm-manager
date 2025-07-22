import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { Production } from './entities/production.entity';
import { CattleModule } from '../cattle/cattle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Production]),
    CattleModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}