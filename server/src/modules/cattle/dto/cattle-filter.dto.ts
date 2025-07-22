import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, CattleStatus } from '../entities/cattle.entity';

export class CattleFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by cattle status',
    enum: CattleStatus,
  })
  @IsOptional()
  @IsEnum(CattleStatus)
  status?: CattleStatus;

  @ApiPropertyOptional({
    description: 'Filter by gender',
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Filter by breed',
    example: 'Holstein',
  })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({
    description: 'Search by name or tag number',
    example: 'Bella',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Minimum age in years',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAge?: number;

  @ApiPropertyOptional({
    description: 'Maximum age in years',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAge?: number;

  @ApiPropertyOptional({
    description: 'Filter cattle born after this date',
    example: '2020-01-01',
  })
  @IsOptional()
  @IsDateString()
  bornAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter cattle born before this date',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsDateString()
  bornBefore?: string;

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
    example: 'name',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}