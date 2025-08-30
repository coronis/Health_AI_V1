import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { StructuredEntity } from './structured-entity.entity';

export enum HealthReportType {
  LAB_REPORT = 'lab_report',
  MEDICAL_IMAGING = 'medical_imaging',
  PRESCRIPTION = 'prescription',
  DISCHARGE_SUMMARY = 'discharge_summary',
  CONSULTATION_NOTES = 'consultation_notes',
  HEALTH_CHECKUP = 'health_checkup',
  VACCINATION_RECORD = 'vaccination_record',
  ALLERGY_TEST = 'allergy_test',
  FITNESS_ASSESSMENT = 'fitness_assessment',
}

export enum ProcessingStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  OCR_COMPLETED = 'ocr_completed',
  NER_COMPLETED = 'ner_completed',
  INTERPRETATION_COMPLETED = 'interpretation_completed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  MANUAL_REVIEW = 'manual_review',
}

@Entity('health_reports')
@Index(['userId'])
@Index(['reportType'])
@Index(['processingStatus'])
@Index(['uploadedAt'])
export class HealthReport extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: HealthReportType,
  })
  reportType: HealthReportType;

  @Column({ type: 'varchar', length: 255 })
  originalFileName: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSizeBytes: number;

  @Column({ type: 'varchar', length: 255 })
  storageKey: string; // S3/GCS object key

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailStorageKey?: string; // For images

  @Column({ type: 'varchar', length: 64 })
  fileChecksum: string; // SHA-256 hash

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.UPLOADED,
  })
  processingStatus: ProcessingStatus;

  @Column({ type: 'timestamptz' })
  uploadedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt?: Date;

  @Column({ type: 'date', nullable: true })
  reportDate?: Date; // Actual date of the medical report

  @Column({ type: 'varchar', length: 255, nullable: true })
  healthcareProvider?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  doctorName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  facilityName?: string;

  // OCR Results
  @Column({ type: 'text', nullable: true })
  ocrText?: string; // Extracted text from OCR

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ocrConfidence?: number; // OCR confidence score

  @Column({ type: 'text', nullable: true })
  ocrMetadata?: string; // JSON metadata from OCR service

  // NER Results
  @Column({ type: 'text', nullable: true })
  nerEntities?: string; // JSON array of extracted entities

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  nerConfidence?: number; // NER confidence score

  // AI Interpretation
  @Column({ type: 'text', nullable: true })
  aiInterpretation?: string; // AI-generated interpretation

  @Column({ type: 'text', nullable: true })
  aiRecommendations?: string; // AI-generated recommendations

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiConfidence?: number; // AI interpretation confidence

  @Column({ type: 'varchar', length: 100, nullable: true })
  aiModel?: string; // Model used for interpretation

  // Processing metadata
  @Column({ type: 'text', nullable: true })
  processingErrors?: string; // JSON array of errors during processing

  @Column({ type: 'text', nullable: true })
  processingLogs?: string; // Processing step logs

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  // Security and compliance
  @Column({ type: 'boolean', default: true })
  isEncrypted: boolean;

  @Column({ type: 'varchar', length: 20, default: 'PHI' })
  dataClassification: string; // PHI, PII, SENSITIVE

  @Column({ type: 'boolean', default: false })
  containsPII: boolean;

  @Column({ type: 'boolean', default: false })
  requiresManualReview: boolean;

  // Sharing and access
  @Column({ type: 'boolean', default: false })
  isSharedWithProvider: boolean;

  @Column({ type: 'text', nullable: true })
  shareTokens?: string; // JSON array of sharing tokens

  @Column({ type: 'timestamptz', nullable: true })
  lastAccessedAt?: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => StructuredEntity, (entity) => entity.healthReport, {
    cascade: true,
  })
  structuredEntities: StructuredEntity[];

  // Helper methods
  isProcessingComplete(): boolean {
    return this.processingStatus === ProcessingStatus.COMPLETED;
  }

  hasErrors(): boolean {
    return (
      this.processingStatus === ProcessingStatus.FAILED ||
      (this.processingErrors && this.processingErrors.length > 0)
    );
  }

  needsManualReview(): boolean {
    return this.processingStatus === ProcessingStatus.MANUAL_REVIEW || this.requiresManualReview;
  }

  getProcessingProgress(): number {
    const statusOrder = [
      ProcessingStatus.UPLOADED,
      ProcessingStatus.PROCESSING,
      ProcessingStatus.OCR_COMPLETED,
      ProcessingStatus.NER_COMPLETED,
      ProcessingStatus.INTERPRETATION_COMPLETED,
      ProcessingStatus.COMPLETED,
    ];

    const currentIndex = statusOrder.indexOf(this.processingStatus);
    return currentIndex === -1 ? 0 : (currentIndex / (statusOrder.length - 1)) * 100;
  }

  getProcessingErrors(): any[] {
    try {
      return this.processingErrors ? JSON.parse(this.processingErrors) : [];
    } catch {
      return [];
    }
  }

  addProcessingError(error: any): void {
    const errors = this.getProcessingErrors();
    errors.push({
      ...error,
      timestamp: new Date().toISOString(),
    });
    this.processingErrors = JSON.stringify(errors);
  }
}
