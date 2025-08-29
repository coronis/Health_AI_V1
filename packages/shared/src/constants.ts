// Constants used across the HealthCoachAI platform

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
} as const;

export const USER_ROLES = {
  USER: 'user',
  PREMIUM_USER: 'premium_user',
  SUPPORT_AGENT: 'support_agent',
  NUTRITIONIST: 'nutritionist',
  DEVELOPER: 'developer',
  SYSTEM_ADMIN: 'system_admin',
  SECURITY_ADMIN: 'security_admin',
} as const;

export const HEALTH_METRIC_TYPES = {
  WEIGHT: 'weight',
  HEIGHT: 'height',
  BLOOD_PRESSURE: 'blood_pressure',
  HEART_RATE: 'heart_rate',
  STEPS: 'steps',
  CALORIES_BURNED: 'calories_burned',
  SLEEP_HOURS: 'sleep_hours',
  BLOOD_SUGAR: 'blood_sugar',
} as const;

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  LOCAL: 'local',
} as const;

export const REQUEST_LEVELS = {
  L1: 'L1', // Health reports - highest accuracy
  L2: 'L2', // Diet/fitness/recipes - cost optimized
} as const;

export const CACHE_KEYS = {
  USER_PROFILE: 'profile',
  FOOD_DATA: 'food',
  AI_RESPONSE: 'ai',
  SESSION: 'session',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
