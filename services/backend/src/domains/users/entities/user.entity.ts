import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserProfile } from './user-profile.entity';
import { UserConsent } from './user-consent.entity';
import { UserIdentity } from './user-identity.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phoneNumber'], { unique: true, where: 'phone_number IS NOT NULL' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil?: Date;

  // GDPR compliance
  @Column({ type: 'boolean', default: false })
  isAnonymized: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  dataRetentionExpiresAt?: Date;

  // Regional data residency
  @Column({ type: 'varchar', length: 10, default: 'IN' })
  dataResidencyRegion: string;

  // Relationships
  @OneToMany(() => UserProfile, (profile) => profile.user, { cascade: true })
  profiles: UserProfile[];

  @OneToMany(() => UserConsent, (consent) => consent.user, { cascade: true })
  consents: UserConsent[];

  @OneToMany(() => UserIdentity, (identity) => identity.user, { cascade: true })
  identities: UserIdentity[];

  // Method to check if user can login
  isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  // Method to check if email is verified
  isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  // Method to check if phone is verified
  isPhoneVerified(): boolean {
    return !!this.phoneVerifiedAt;
  }
}
