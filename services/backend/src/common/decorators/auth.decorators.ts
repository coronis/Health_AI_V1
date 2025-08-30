import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (no authentication required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Require specific roles for a route
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Require specific permissions for a route
 */
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

/**
 * Skip rate limiting for a route
 */
export const SkipThrottle = () => SetMetadata('skipThrottle', true);

/**
 * Set custom rate limiting for a route
 */
export const Throttle = (limit: number, ttl: number) => SetMetadata('throttle', { limit, ttl });

/**
 * Mark route as requiring data classification check
 */
export const DataClassification = (level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED') => 
  SetMetadata('dataClassification', level);

/**
 * Mark route as requiring audit logging
 */
export const AuditLog = (action?: string) => SetMetadata('auditLog', action || true);

/**
 * Mark route as requiring DLP scanning
 */
export const DlpScan = () => SetMetadata('dlpScan', true);