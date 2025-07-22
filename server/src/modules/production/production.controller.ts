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
  ApiParam,
} from '@nestjs/swagger';
import { ProductionService } from './production.service';
import {
  CreateProductionDto,
  UpdateProductionDto,
  ProductionFilterDto,
  BulkProductionDto,
  VerifyProductionDto,
} from './dto';
import { Production, MilkingSession, ProductionStatus } from './entities/production.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';

@ApiTags('production')
@ApiBearerAuth()
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER)
  @ApiOperation({ summary: 'Create a new production record' })
  @ApiResponse({
    status: 201,
    description: 'Production record created successfully',
    type: Production,
  })
  @ApiResponse({
    status: 409,
    description: 'Production record already exists for this cattle/date/session',
  })
  @ApiResponse({
    status: 400,
    description: 'Cattle is not eligible for milk production',
  })
  create(
    @Body() createProductionDto: CreateProductionDto,
    @CurrentUser() user: User,
  ): Promise<Production> {
    return this.productionService.create(createProductionDto, user.id);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER)
  @ApiOperation({ summary: 'Create multiple production records' })
  @ApiResponse({
    status: 201,
    description: 'Production records created successfully',
    type: [Production],
  })
  @ApiResponse({
    status: 400,
    description: 'Some or all records failed validation',
  })
  bulkCreate(
    @Body() bulkProductionDto: BulkProductionDto,
    @CurrentUser() user: User,
  ): Promise<Production[]> {
    return this.productionService.bulkCreate(bulkProductionDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all production records with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of production records retrieved successfully',
  })
  @ApiQuery({ name: 'session', enum: MilkingSession, required: false })
  @ApiQuery({ name: 'status', enum: ProductionStatus, required: false })
  @ApiQuery({ name: 'cattleId', required: false, type: Number })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() filters: ProductionFilterDto) {
    return this.productionService.findAll(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get production statistics' })
  @ApiResponse({
    status: 200,
    description: 'Production statistics retrieved successfully',
  })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  getStatistics(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.productionService.getStatistics(fromDate, toDate);
  }

  @Get('daily-summary/:date')
  @ApiOperation({ summary: 'Get daily production summary' })
  @ApiResponse({
    status: 200,
    description: 'Daily production summary retrieved successfully',
  })
  @ApiParam({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2025-01-15',
  })
  getDailySummary(@Param('date') date: string) {
    return this.productionService.getDailySummary(date);
  }

  @Get('monthly-report/:year/:month')
  @ApiOperation({ summary: 'Get monthly production report' })
  @ApiResponse({
    status: 200,
    description: 'Monthly production report retrieved successfully',
  })
  @ApiParam({
    name: 'year',
    description: 'Year',
    example: 2025,
  })
  @ApiParam({
    name: 'month',
    description: 'Month (1-12)',
    example: 1,
  })
  getMonthlyReport(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.productionService.getMonthlyReport(year, month);
  }

  @Get('cattle/:cattleId/history')
  @ApiOperation({ summary: 'Get production history for a specific cattle' })
  @ApiResponse({
    status: 200,
    description: 'Cattle production history retrieved successfully',
    type: [Production],
  })
  @ApiParam({
    name: 'cattleId',
    description: 'ID of the cattle',
  })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  getCattleProductionHistory(
    @Param('cattleId', ParseIntPipe) cattleId: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<Production[]> {
    return this.productionService.getCattleProductionHistory(cattleId, fromDate, toDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get production record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Production record found successfully',
    type: Production,
  })
  @ApiResponse({
    status: 404,
    description: 'Production record not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Production> {
    return this.productionService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.WORKER)
  @ApiOperation({ summary: 'Update production record' })
  @ApiResponse({
    status: 200,
    description: 'Production record updated successfully',
    type: Production,
  })
  @ApiResponse({
    status: 404,
    description: 'Production record not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update verified or rejected records',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductionDto: UpdateProductionDto,
  ): Promise<Production> {
    return this.productionService.update(id, updateProductionDto);
  }

  @Patch(':id/verify')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Verify or reject production record' })
  @ApiResponse({
    status: 200,
    description: 'Production record verified successfully',
    type: Production,
  })
  @ApiResponse({
    status: 404,
    description: 'Production record not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Production record is already verified or rejected',
  })
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body() verifyProductionDto: VerifyProductionDto,
    @CurrentUser() user: User,
  ): Promise<Production> {
    return this.productionService.verify(id, verifyProductionDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete production record (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Production record deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Production record not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete verified or rejected records',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productionService.remove(id);
  }
}