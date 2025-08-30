import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HealthReportsService } from '../services/health-reports.service';
import { HealthReportType, ProcessingStatus } from '../entities/health-report.entity';

@ApiTags('Health Reports')
@Controller({ path: 'health-reports', version: '1' })
@UseGuards(ThrottlerGuard)
@ApiBearerAuth()
export class HealthReportsController {
  private readonly logger = new Logger(HealthReportsController.name);

  constructor(private readonly healthReportsService: HealthReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get health reports with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 50)',
    example: 10,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by report type',
    enum: HealthReportType,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by processing status',
    enum: ProcessingStatus,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health reports retrieved successfully',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('type') type?: HealthReportType,
    @Query('status') status?: ProcessingStatus,
  ) {
    const maxLimit = Math.min(limit, 50);
    this.logger.log(`Getting health reports: page=${page}, limit=${maxLimit}`);
    
    return this.healthReportsService.findAll(page, maxLimit, type, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get health report by ID' })
  @ApiParam({
    name: 'id',
    description: 'Health report UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health report retrieved successfully',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Getting health report: ${id}`);
    return this.healthReportsService.findOne(id);
  }
}