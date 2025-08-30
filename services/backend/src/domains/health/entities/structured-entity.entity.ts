import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { HealthReport } from './health-report.entity';

export enum EntityType {
  // Lab Values
  LAB_TEST = 'lab_test',
  LAB_VALUE = 'lab_value',
  BIOMARKER = 'biomarker',

  // Medications
  MEDICATION = 'medication',
  DOSAGE = 'dosage',
  PRESCRIPTION = 'prescription',

  // Conditions
  DIAGNOSIS = 'diagnosis',
  SYMPTOM = 'symptom',
  CONDITION = 'condition',

  // Procedures
  PROCEDURE = 'procedure',
  TREATMENT = 'treatment',
  SURGERY = 'surgery',

  // Vitals
  BLOOD_PRESSURE = 'blood_pressure',
  HEART_RATE = 'heart_rate',
  TEMPERATURE = 'temperature',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BMI = 'bmi',

  // Other
  ALLERGY = 'allergy',
  VACCINATION = 'vaccination',
  DOCTOR = 'doctor',
  FACILITY = 'facility',
  DATE = 'date',
  RECOMMENDATION = 'recommendation',
}

export enum EntityUnit {
  // Common lab units
  MG_DL = 'mg/dL',
  G_DL = 'g/dL',
  MMOL_L = 'mmol/L',
  IU_L = 'IU/L',
  U_L = 'U/L',
  NG_ML = 'ng/mL',
  PG_ML = 'pg/mL',
  MCG_ML = 'mcg/mL',

  // Vital units
  MMHG = 'mmHg',
  BPM = 'bpm',
  CELSIUS = '°C',
  FAHRENHEIT = '°F',
  KG = 'kg',
  LB = 'lb',
  CM = 'cm',
  INCH = 'inch',
  PERCENT = '%',

  // Other
  NONE = 'none',
  COUNT = 'count',
  RATIO = 'ratio',
}

@Entity('structured_entities')
@Index(['healthReportId'])
@Index(['entityType'])
@Index(['extractedText'])
@Index(['normalizedValue'])
export class StructuredEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  healthReportId: string;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column({ type: 'varchar', length: 500 })
  extractedText: string; // Original text from OCR

  @Column({ type: 'varchar', length: 500, nullable: true })
  normalizedText?: string; // Cleaned/normalized text

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  normalizedValue?: number; // Numeric value if applicable

  @Column({
    type: 'enum',
    enum: EntityUnit,
    nullable: true,
  })
  unit?: EntityUnit;

  @Column({ type: 'varchar', length: 255, nullable: true })
  standardCode?: string; // LOINC, SNOMED, ICD-10 code

  @Column({ type: 'varchar', length: 255, nullable: true })
  standardSystem?: string; // LOINC, SNOMED, ICD-10

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number; // NER extraction confidence

  @Column({ type: 'int' })
  startPosition: number; // Character position in original text

  @Column({ type: 'int' })
  endPosition: number; // Character position in original text

  @Column({ type: 'varchar', length: 100, nullable: true })
  extractionModel?: string; // Model used for extraction

  // Reference ranges for lab values
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  referenceMin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  referenceMax?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceRange?: string; // Textual reference range

  @Column({ type: 'boolean', nullable: true })
  isAbnormal?: boolean; // Whether value is outside normal range

  @Column({ type: 'varchar', length: 20, nullable: true })
  abnormalFlag?: string; // HIGH, LOW, CRITICAL

  // Temporal information
  @Column({ type: 'date', nullable: true })
  observationDate?: Date; // When the observation was made

  @Column({ type: 'timestamptz', nullable: true })
  observationTime?: Date; // Full timestamp if available

  // Context and relationships
  @Column({ type: 'varchar', length: 255, nullable: true })
  testName?: string; // Full test name for lab values

  @Column({ type: 'varchar', length: 255, nullable: true })
  testPanel?: string; // Panel this test belongs to

  @Column({ type: 'text', nullable: true })
  contextText?: string; // Surrounding text for context

  @Column({ type: 'varchar', length: 255, nullable: true })
  relatedEntityId?: string; // Link to related entity

  // Quality and validation
  @Column({ type: 'boolean', default: false })
  isValidated: boolean; // Human validation status

  @Column({ type: 'varchar', length: 255, nullable: true })
  validatedBy?: string; // Who validated this entity

  @Column({ type: 'timestamptz', nullable: true })
  validatedAt?: Date;

  @Column({ type: 'text', nullable: true })
  validationNotes?: string;

  @Column({ type: 'boolean', default: false })
  needsReview: boolean; // Flagged for manual review

  // Metadata
  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON metadata

  @Column({ type: 'varchar', length: 50, nullable: true })
  severity?: string; // For conditions/symptoms

  @Column({ type: 'varchar', length: 50, nullable: true })
  status?: string; // Active, resolved, chronic, etc.

  // Relationships
  @ManyToOne(() => HealthReport, (report) => report.structuredEntities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'health_report_id' })
  healthReport: HealthReport;

  // Helper methods
  isNumericValue(): boolean {
    return this.normalizedValue !== null && this.normalizedValue !== undefined;
  }

  isWithinNormalRange(): boolean {
    if (!this.isNumericValue()) return true;
    if (this.referenceMin !== null && this.normalizedValue < this.referenceMin) return false;
    if (this.referenceMax !== null && this.normalizedValue > this.referenceMax) return false;
    return true;
  }

  getAbnormalSeverity(): 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL' | null {
    if (!this.isAbnormal || !this.isNumericValue()) return null;

    const value = this.normalizedValue;
    const min = this.referenceMin;
    const max = this.referenceMax;

    if (min !== null && value < min) {
      const ratio = min / value;
      if (ratio > 3) return 'CRITICAL';
      if (ratio > 2) return 'SEVERE';
      if (ratio > 1.5) return 'MODERATE';
      return 'MILD';
    }

    if (max !== null && value > max) {
      const ratio = value / max;
      if (ratio > 3) return 'CRITICAL';
      if (ratio > 2) return 'SEVERE';
      if (ratio > 1.5) return 'MODERATE';
      return 'MILD';
    }

    return null;
  }

  getMetadata(): any {
    try {
      return this.metadata ? JSON.parse(this.metadata) : {};
    } catch {
      return {};
    }
  }

  setMetadata(data: any): void {
    this.metadata = JSON.stringify(data);
  }

  // Method to get formatted value with unit
  getFormattedValue(): string {
    if (!this.isNumericValue()) return this.normalizedText || this.extractedText;

    const value = this.normalizedValue.toString();
    return this.unit && this.unit !== EntityUnit.NONE ? `${value} ${this.unit}` : value;
  }
}
