import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active',
}

export enum ProfileType {
  BASIC = 'basic',
  LIFESTYLE = 'lifestyle',
  HEALTH_FLAGS = 'health_flags',
}

@Entity('user_profiles')
@Index(['userId', 'profileType'], { unique: true })
export class UserProfile extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ProfileType,
  })
  profileType: ProfileType;

  // Basic Profile Data
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height?: number; // in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number; // in kg

  @Column({ type: 'varchar', length: 10, nullable: true })
  timezone?: string; // e.g., 'Asia/Kolkata'

  @Column({ type: 'varchar', length: 10, nullable: true })
  locale?: string; // e.g., 'en-IN', 'hi-IN'

  // Lifestyle Profile Data
  @Column({
    type: 'enum',
    enum: ActivityLevel,
    nullable: true,
  })
  activityLevel?: ActivityLevel;

  @Column({ type: 'text', nullable: true })
  fitnessGoals?: string; // JSON string

  @Column({ type: 'text', nullable: true })
  nutritionGoals?: string; // JSON string

  @Column({ type: 'text', nullable: true })
  dietaryPreferences?: string; // JSON string

  @Column({ type: 'text', nullable: true })
  allergens?: string; // JSON string

  @Column({ type: 'text', nullable: true })
  cuisinePreferences?: string; // JSON string

  @Column({ type: 'varchar', length: 50, nullable: true })
  sleepSchedule?: string; // e.g., '22:00-06:00'

  @Column({ type: 'int', nullable: true })
  workoutFrequency?: number; // times per week

  // Health Flags (encrypted)
  @Column({ type: 'text', nullable: true })
  medicalConditions?: string; // Encrypted JSON

  @Column({ type: 'text', nullable: true })
  medications?: string; // Encrypted JSON

  @Column({ type: 'text', nullable: true })
  healthConcerns?: string; // Encrypted JSON

  @Column({ type: 'boolean', default: false })
  isPregnant?: boolean;

  @Column({ type: 'boolean', default: false })
  isBreastfeeding?: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  menstrualCycle?: string; // Encrypted

  // Data classification tags
  @Column({ type: 'varchar', length: 20, default: 'PII' })
  dataClassification: string; // PII, PHI, BEHAVIORAL, PUBLIC

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  // Relationships
  @ManyToOne(() => User, (user) => user.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  getAge(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getBMI(): number | null {
    if (!this.height || !this.weight) return null;
    const heightInM = this.height / 100;
    return Number((this.weight / (heightInM * heightInM)).toFixed(2));
  }
}
