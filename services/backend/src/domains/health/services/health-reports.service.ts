import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthReport, HealthReportType, ProcessingStatus } from '../entities/health-report.entity';

@Injectable()
export class HealthReportsService {
  private readonly logger = new Logger(HealthReportsService.name);

  constructor(
    @InjectRepository(HealthReport)
    private healthReportsRepository: Repository<HealthReport>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: HealthReportType,
    status?: ProcessingStatus,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.healthReportsRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.structuredEntities', 'entities')
      .skip(skip)
      .take(limit)
      .orderBy('report.createdAt', 'DESC');

    if (type) {
      queryBuilder.andWhere('report.reportType = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('report.processingStatus = :status', { status });
    }

    const [reports, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      reports,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<HealthReport> {
    const report = await this.healthReportsRepository.findOne({
      where: { id },
      relations: ['structuredEntities', 'user'],
    });

    if (!report) {
      throw new NotFoundException(`Health report with ID ${id} not found`);
    }

    return report;
  }
}