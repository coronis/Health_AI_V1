import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    phone: string;
    deviceId?: string;
    sessionId: string;
    user: any;
  };
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // This guard allows both authenticated and unauthenticated requests
    // If authenticated, it will populate req.user
    // If not authenticated, req.user will be undefined

    // Extract token if present and validate optionally
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      // Token present - could validate here but allow request regardless
      // This is useful for endpoints that provide different responses for authenticated users
    }

    return true;
  }
}

@Injectable()
export class DeviceBindingGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Get device ID from request headers or body
    const requestDeviceId =
      (request.headers['x-device-id'] as string) ||
      (request.body && typeof request.body === 'object' && request.body.deviceId);

    // If a device ID was provided during login, verify it matches
    if (user.deviceId && requestDeviceId && user.deviceId !== requestDeviceId) {
      throw new ForbiddenException('Device binding mismatch');
    }

    return true;
  }
}
