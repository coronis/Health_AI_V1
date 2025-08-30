import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

export enum ConsentType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  DATA_PROCESSING = 'data_processing',
  MARKETING = 'marketing',
  HEALTH_DATA = 'health_data',
  AI_PROCESSING = 'ai_processing',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  COOKIES = 'cookies',
  ANALYTICS = 'analytics',
}

export enum ConsentStatus {
  GRANTED = 'granted',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

@Entity('user_consents')
@Index(['userId', 'consentType'])
@Index(['expiresAt'])
export class UserConsent extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ConsentType,
  })
  consentType: ConsentType;

  @Column({
    type: 'enum',
    enum: ConsentStatus,
    default: ConsentStatus.GRANTED,
  })
  status: ConsentStatus;

  @Column({ type: 'varchar', length: 50 })
  version: string; // Version of the consent document

  @Column({ type: 'timestamptz' })
  grantedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  withdrawnAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  consentMethod?: string; // 'web_form', 'mobile_app', 'phone', 'email'

  @Column({ type: 'text', nullable: true })
  purpose?: string; // Specific purpose for data processing

  @Column({ type: 'text', nullable: true })
  dataCategories?: string; // Types of data covered by this consent

  @Column({ type: 'boolean', default: false })
  isRequired: boolean; // Whether this consent is required for service

  @Column({ type: 'text', nullable: true })
  legalBasis?: string; // GDPR legal basis

  // For audit trail
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.consents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  isActive(): boolean {
    if (this.status !== ConsentStatus.GRANTED) return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
  }

  isExpired(): boolean {
    return this.expiresAt && this.expiresAt < new Date();
  }

  getRemainingDays(): number | null {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
