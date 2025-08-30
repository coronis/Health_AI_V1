import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

export enum IdentityProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
  PHONE_OTP = 'phone_otp',
}

@Entity('user_identities')
@Index(['provider', 'providerId'], { unique: true })
@Index(['userId'])
export class UserIdentity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: IdentityProvider,
  })
  provider: IdentityProvider;

  @Column({ type: 'varchar', length: 255 })
  providerId: string; // External provider's user ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  accessToken?: string; // Encrypted

  @Column({ type: 'text', nullable: true })
  refreshToken?: string; // Encrypted

  @Column({ type: 'timestamptz', nullable: true })
  tokenExpiresAt?: Date;

  @Column({ type: 'boolean', default: true })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON string for provider-specific data

  // OAuth specific fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  scope?: string;

  // Device binding for enhanced security
  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceFingerprint?: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.identities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  isTokenValid(): boolean {
    if (!this.accessToken) return false;
    if (this.tokenExpiresAt && this.tokenExpiresAt < new Date()) return false;
    return true;
  }

  needsRefresh(): boolean {
    if (!this.tokenExpiresAt) return false;
    // Check if token expires within next 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return this.tokenExpiresAt < fiveMinutesFromNow;
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
}
