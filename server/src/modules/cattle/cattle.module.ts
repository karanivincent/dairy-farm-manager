import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CattleService } from './cattle.service';
import { CattleController } from './cattle.controller';
import { Cattle } from './entities/cattle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cattle])],
  controllers: [CattleController],
  providers: [CattleService],
  exports: [CattleService],
})
export class CattleModule {}