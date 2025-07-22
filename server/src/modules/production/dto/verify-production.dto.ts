import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductionStatus } from '../entities/production.entity';

export class VerifyProductionDto {
  @ApiProperty({
    description: 'New status for the production record',
    enum: [ProductionStatus.VERIFIED, ProductionStatus.REJECTED],
    example: ProductionStatus.VERIFIED,
  })
  @IsEnum([ProductionStatus.VERIFIED, ProductionStatus.REJECTED])
  status: ProductionStatus.VERIFIED | ProductionStatus.REJECTED;

  @ApiPropertyOptional({
    description: 'Notes about the verification',
    example: 'Quality checks passed, approved by supervisor',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}