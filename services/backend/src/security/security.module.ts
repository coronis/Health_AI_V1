import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

import { DlpService } from './services/dlp.service';
import { EncryptionService } from './services/encryption.service';
import { SecurityService } from './services/security.service';
import { AuthGuard } from './guards/auth.guard';
import { RbacGuard } from './guards/rbac.guard';
import { SecurityInterceptor } from './interceptors/security.interceptor';
import { SecurityExceptionFilter } from './filters/security-exception.filter';
import { AuditLogService } from './services/audit-log.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'demo-jwt-secret-replace-in-production'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
          issuer: configService.get('JWT_ISSUER', 'healthcoachai'),
          audience: configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
        },
        verifyOptions: {
          issuer: configService.get('JWT_ISSUER', 'healthcoachai'),
          audience: configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    DlpService,
    EncryptionService,
    SecurityService,
    AuditLogService,
    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
    // Global filters
    {
      provide: APP_FILTER,
      useClass: SecurityExceptionFilter,
    },
  ],
  exports: [
    DlpService,
    EncryptionService,
    SecurityService,
    AuditLogService,
    JwtModule,
  ],
})
export class SecurityModule {}