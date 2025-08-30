import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StructuredEntity } from '../entities/structured-entity.entity';

@Injectable()
export class StructuredEntitiesService {
  private readonly logger = new Logger(StructuredEntitiesService.name);

  constructor(
    @InjectRepository(StructuredEntity)
    private structuredEntitiesRepository: Repository<StructuredEntity>,
  ) {}

  async findByHealthReportId(healthReportId: string): Promise<StructuredEntity[]> {
    return this.structuredEntitiesRepository.find({
      where: { healthReportId },
      order: { confidence: 'DESC' },
    });
  }
}