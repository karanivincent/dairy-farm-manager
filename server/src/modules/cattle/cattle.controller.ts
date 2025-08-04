import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CattleService } from './cattle.service';
import { CreateCattleDto, UpdateCattleDto, CattleFilterDto } from './dto';
import { Cattle, CattleStatus } from './entities/cattle.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('cattle')
@ApiBearerAuth()
@Controller('cattle')
export class CattleController {
  constructor(private readonly cattleService: CattleService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new cattle record' })
  @ApiResponse({
    status: 201,
    description: 'Cattle record created successfully',
    type: Cattle,
  })
  @ApiResponse({
    status: 409,
    description: 'Cattle with this tag number already exists',
  })
  create(@Body() createCattleDto: CreateCattleDto): Promise<Cattle> {
    return this.cattleService.create(createCattleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cattle with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of cattle retrieved successfully',
  })
  @ApiQuery({ name: 'status', enum: CattleStatus, required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'breed', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() filters: CattleFilterDto) {
    return this.cattleService.findAll(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get cattle statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cattle statistics retrieved successfully',
  })
  getStatistics() {
    return this.cattleService.getStatistics();
  }

  @Get('milking-cows')
  @ApiOperation({ summary: 'Get active milking cows' })
  @ApiResponse({
    status: 200,
    description: 'Active milking cows retrieved successfully',
    type: [Cattle],
  })
  getActiveMilkingCows(): Promise<Cattle[]> {
    return this.cattleService.getActiveMilkingCows();
  }

  @Get('check-tag/:tagNumber')
  @ApiOperation({ summary: 'Check if tag number exists' })
  @ApiResponse({
    status: 200,
    description: 'Tag number check result',
    schema: {
      type: 'object',
      properties: {
        exists: {
          type: 'boolean',
          description: 'Whether the tag number already exists',
        },
      },
    },
  })
  async checkTagNumber(
    @Param('tagNumber') tagNumber: string,
  ): Promise<{ exists: boolean }> {
    try {
      await this.cattleService.findByTagNumber(tagNumber);
      return { exists: true };
    } catch (error) {
      return { exists: false };
    }
  }

  @Get('tag/:tagNumber')
  @ApiOperation({ summary: 'Get cattle by tag number' })
  @ApiResponse({
    status: 200,
    description: 'Cattle found successfully',
    type: Cattle,
  })
  @ApiResponse({
    status: 404,
    description: 'Cattle not found',
  })
  findByTagNumber(@Param('tagNumber') tagNumber: string): Promise<Cattle> {
    return this.cattleService.findByTagNumber(tagNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cattle by ID' })
  @ApiResponse({
    status: 200,
    description: 'Cattle found successfully',
    type: Cattle,
  })
  @ApiResponse({
    status: 404,
    description: 'Cattle not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cattle> {
    return this.cattleService.findOne(id);
  }

  @Get(':id/offspring')
  @ApiOperation({ summary: 'Get offspring of a cattle' })
  @ApiResponse({
    status: 200,
    description: 'Offspring retrieved successfully',
    type: [Cattle],
  })
  getOffspring(@Param('id', ParseIntPipe) id: number): Promise<Cattle[]> {
    return this.cattleService.getOffspring(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update cattle record' })
  @ApiResponse({
    status: 200,
    description: 'Cattle updated successfully',
    type: Cattle,
  })
  @ApiResponse({
    status: 404,
    description: 'Cattle not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCattleDto: UpdateCattleDto,
  ): Promise<Cattle> {
    return this.cattleService.update(id, updateCattleDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER)
  @ApiOperation({ summary: 'Update cattle status' })
  @ApiResponse({
    status: 200,
    description: 'Cattle status updated successfully',
    type: Cattle,
  })
  @ApiResponse({
    status: 404,
    description: 'Cattle not found',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: CattleStatus,
  ): Promise<Cattle> {
    return this.cattleService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete cattle record (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Cattle deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cattle not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cattleService.remove(id);
  }
}