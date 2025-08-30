import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../services/token.service';
import { SecurityService } from '../../security/services/security.service';
import { AuditLogService } from '../../security/services/audit-log.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly securityService: SecurityService,
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authentication token required');
    }

    try {
      // Verify token
      const payload = await this.tokenService.verifyAccessToken(token);

      // Validate device binding
      const deviceInfo = this.extractDeviceInfo(request);
      const isValidDevice = await this.securityService.validateDeviceBinding(
        payload.deviceFingerprint,
        deviceInfo
      );

      if (!isValidDevice) {
        throw new UnauthorizedException('Device binding validation failed');
      }

      // Check for suspicious behavior
      const behaviorCheck = await this.securityService.detectBehaviorAnomalies(
        payload.userId,
        request.method + '_' + request.route?.path,
        {
          userId: payload.userId,
          ipAddress: this.getIpAddress(request),
          userAgent: request.headers['user-agent'],
          sessionId: payload.sessionId,
        }
      );

      if (behaviorCheck.isAnomalous && behaviorCheck.riskScore > 0.8) {
        // Log high-risk behavior and deny access
        await this.auditLogService.logSecurityEvent({
          type: 'SUSPICIOUS_ACCESS',
          severity: 'HIGH',
          userId: payload.userId,
          ipAddress: this.getIpAddress(request),
          details: {
            riskScore: behaviorCheck.riskScore,
            reasons: behaviorCheck.reasons,
            endpoint: request.route?.path,
            method: request.method,
          },
          timestamp: new Date(),
        });

        throw new UnauthorizedException('Access denied due to suspicious activity');
      }

      // Attach user info to request
      request.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
      };

      // Log successful authentication
      await this.auditLogService.logUserAction({
        userId: payload.userId,
        action: 'API_ACCESS',
        resource: `${request.method} ${request.route?.path}`,
        outcome: 'SUCCESS',
        severity: 'LOW',
        ipAddress: this.getIpAddress(request),
        userAgent: request.headers['user-agent'],
        sessionId: payload.sessionId,
      });

      return true;
    } catch (error) {
      // Log failed authentication attempt
      await this.auditLogService.logUserAction({
        action: 'API_ACCESS_FAILED',
        resource: `${request.method} ${request.route?.path}`,
        outcome: 'FAILURE',
        severity: 'MEDIUM',
        ipAddress: this.getIpAddress(request),
        userAgent: request.headers['user-agent'],
        details: {
          reason: error.message,
          token: token ? 'present' : 'missing',
        },
      });

      throw error;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractDeviceInfo(request: any): any {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: this.getIpAddress(request),
      acceptLanguage: request.headers['accept-language'],
      // Additional device fingerprinting data can be added here
    };
  }

  private getIpAddress(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }
}