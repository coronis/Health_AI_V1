// Input validation schemas using Zod

import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email format');

export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format');

export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  heightCm: z.number().min(50).max(300).optional(),
  weightKg: z.number().min(20).max(500).optional(),
  activityLevel: z
    .enum([
      'sedentary',
      'lightly-active',
      'moderately-active',
      'very-active',
      'extremely-active',
    ])
    .optional(),
});

export const healthMetricSchema = z.object({
  metricType: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  recordedAt: z.date(),
  source: z.string().min(1),
});

export const aiRequestSchema = z.object({
  level: z.enum(['L1', 'L2']),
  requestType: z.string().min(1),
  content: z.string().min(1).max(10000),
  context: z.record(z.unknown()).optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type HealthMetricInput = z.infer<typeof healthMetricSchema>;
export type AIRequestInput = z.infer<typeof aiRequestSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
