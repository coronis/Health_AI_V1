// Common types used across the HealthCoachAI platform

export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type User = BaseEntity & {
  phone?: string;
  email?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
};

export type UserProfile = BaseEntity & {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  heightCm?: number;
  weightKg?: number;
  activityLevel?:
    | 'sedentary'
    | 'lightly-active'
    | 'moderately-active'
    | 'very-active'
    | 'extremely-active';
};

export type HealthMetric = BaseEntity & {
  userId: string;
  metricType: string;
  value: number;
  unit: string;
  recordedAt: Date;
  source: string;
};

export type RequestLevel = 'L1' | 'L2';

export type AIRequest = {
  userId: string;
  level: RequestLevel;
  requestType: string;
  content: string;
  context?: Record<string, unknown>;
};

export type AIResponse = {
  provider: string;
  model: string;
  content: string;
  tokensUsed: number;
  costCents: number;
  quality?: number;
  cacheHit: boolean;
};
