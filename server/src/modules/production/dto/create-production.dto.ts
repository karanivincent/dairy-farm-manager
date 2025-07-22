import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MilkingSession } from '../entities/production.entity';

export class CreateProductionDto {
  @ApiProperty({
    description: 'Date of production record',
    example: '2025-01-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Milking session',
    enum: MilkingSession,
    example: MilkingSession.MORNING,
  })
  @IsEnum(MilkingSession)
  session: MilkingSession;

  @ApiProperty({
    description: 'Milk quantity in liters',
    example: 25.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @IsPositive()
  @Max(100)
  quantity: number;

  @ApiProperty({
    description: 'ID of the cattle that produced the milk',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  cattleId: number;

  @ApiPropertyOptional({
    description: 'Fat content percentage',
    example: 3.8,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(10)
  fatContent?: number;

  @ApiPropertyOptional({
    description: 'Protein content percentage',
    example: 3.2,
    minimum: 0,
    maximum: 8,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(8)
  proteinContent?: number;

  @ApiPropertyOptional({
    description: 'Milk temperature in celsius',
    example: 37.5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Type(() => Number)
  @Min(0)
  @Max(50)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the production',
    example: 'Cow seemed healthy, good milk flow',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Quality metrics as JSON object',
    example: {
      somaticCellCount: 150000,
      bacteriaCount: 5000,
      lactoseContent: 4.8,
    },
  })
  @IsOptional()
  @IsObject()
  qualityMetrics?: {
    somaticCellCount?: number;
    bacteriaCount?: number;
    lactoseContent?: number;
    [key: string]: any;
  };
}