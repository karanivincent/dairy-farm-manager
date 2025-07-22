import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductionDto } from './create-production.dto';

export class UpdateProductionDto extends PartialType(
  OmitType(CreateProductionDto, ['cattleId'] as const)
) {}