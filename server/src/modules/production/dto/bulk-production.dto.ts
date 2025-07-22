import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductionDto } from './create-production.dto';

export class BulkProductionDto {
  @ApiProperty({
    description: 'Array of production records to create',
    type: [CreateProductionDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductionDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  productions: CreateProductionDto[];
}