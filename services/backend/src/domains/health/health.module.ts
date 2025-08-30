import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthReport } from './entities/health-report.entity';
import { StructuredEntity } from './entities/structured-entity.entity';
import { HealthReportsController } from './controllers/health-reports.controller';
import { HealthReportsService } from './services/health-reports.service';
import { StructuredEntitiesService } from './services/structured-entities.service';

@Module({
  imports: [TypeOrmModule.forFeature([HealthReport, StructuredEntity])],
  controllers: [HealthReportsController],
  providers: [HealthReportsService, StructuredEntitiesService],
  exports: [HealthReportsService, StructuredEntitiesService],
})
export class HealthDomainModule {}
