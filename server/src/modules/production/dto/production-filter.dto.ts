import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MilkingSession, ProductionStatus } from '../entities/production.entity';

export class ProductionFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by milking session',
    enum: MilkingSession,
  })
  @IsOptional()
  @IsEnum(MilkingSession)
  session?: MilkingSession;

  @ApiPropertyOptional({
    description: 'Filter by production status',
    enum: ProductionStatus,
  })
  @IsOptional()
  @IsEnum(ProductionStatus)
  status?: ProductionStatus;

  @ApiPropertyOptional({
    description: 'Filter by cattle ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cattleId?: number;

  @ApiPropertyOptional({
    description: 'Filter records from this date',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter records to this date',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific date',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Minimum quantity in liters',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minQuantity?: number;

  @ApiPropertyOptional({
    description: 'Maximum quantity in liters',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxQuantity?: number;

  @ApiPropertyOptional({
    description: 'Search by cattle name or tag number',
    example: 'Bella',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'date',
    default: 'date',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'date';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}