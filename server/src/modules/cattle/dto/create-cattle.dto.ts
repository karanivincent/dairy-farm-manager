import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsUrl,
  Length,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Gender, CattleStatus } from '../entities/cattle.entity';

export class CreateCattleDto {
  @ApiProperty({
    description: 'Unique tag number for the cattle',
    example: 'COW-001',
    maxLength: 50,
  })
  @IsString()
  @Length(1, 50)
  tagNumber: string;

  @ApiProperty({
    description: 'Name of the cattle',
    example: 'Bella',
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Breed of the cattle',
    example: 'Holstein',
    maxLength: 50,
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @Length(1, 50)
  breed?: string;

  @ApiPropertyOptional({
    description: 'Birth date of the cattle',
    example: '2020-05-15',
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsDateString()
  birthDate?: string;

  @ApiProperty({
    description: 'Gender of the cattle',
    enum: Gender,
    example: Gender.FEMALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({
    description: 'Current status of the cattle',
    enum: CattleStatus,
    example: CattleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CattleStatus)
  status?: CattleStatus = CattleStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Weight of the cattle in kg',
    example: 650.5,
    minimum: 0,
    maximum: 2000,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @Max(2000)
  weight?: number;

  @ApiPropertyOptional({
    description: 'URL to the cattle photo',
    example: 'https://example.com/photos/cow-001.jpg',
  })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the cattle',
    example: 'High milk producer, gentle temperament',
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'ID of the parent bull',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  parentBullId?: number;

  @ApiPropertyOptional({
    description: 'ID of the parent cow',
    example: 2,
  })
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  parentCowId?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    example: { rfidTag: 'RF123456', earTag: 'ET789' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}