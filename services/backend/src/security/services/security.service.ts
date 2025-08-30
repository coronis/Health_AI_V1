import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DlpService } from './dlp.service';
import { EncryptionService } from './encryption.service';
import { AuditLogService } from './audit-log.service';

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface SecurityContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  deviceFingerprint?: string;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dlpService: DlpService,
    private readonly encryptionService: EncryptionService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Validate overall security configuration
   */
  validateSecurityConfiguration(): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check JWT configuration
    const jwtSecret = this.configService.get('JWT_SECRET');
    if (!jwtSecret || jwtSecret === 'demo-jwt-secret-replace-in-production') {
      errors.push('JWT secret is using demo value - must be replaced in production');
    }

    // Check encryption configuration
    const encryptionResult = this.encryptionService.validateConfiguration();
    if (!encryptionResult.isValid) {
      warnings.push(...encryptionResult.warnings);
    }

    // Check database SSL configuration
    const dbSsl = this.configService.get('DB_SSL');
    if (!dbSsl) {
      warnings.push('Database SSL is disabled - enable for production');
    }

    // Check CORS configuration
    const corsOrigins = this.configService.get('CORS_ORIGINS');
    if (!corsOrigins || corsOrigins.includes('*')) {
      warnings.push('CORS is allowing all origins - restrict for production');
    }

    // Check rate limiting configuration
    const throttleLimit = this.configService.get('THROTTLE_LIMIT');
    if (!throttleLimit || parseInt(throttleLimit) > 1000) {
      recommendations.push('Consider reducing rate limit for better security');
    }

    // Check session configuration
    const sessionSecret = this.configService.get('SESSION_SECRET');
    if (!sessionSecret || sessionSecret === 'demo-session-secret') {
      errors.push('Session secret is using demo value - must be replaced in production');
    }

    // Check Redis password
    const redisPassword = this.configService.get('REDIS_PASSWORD');
    if (!redisPassword) {
      warnings.push('Redis password not set - enable authentication for production');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Sanitize data before external AI API calls
   */
  async sanitizeForExternalAI(data: any, context: SecurityContext): Promise<any> {
    // Log the sanitization attempt
    await this.auditLogService.logUserAction({
      userId: context.userId,
      action: 'AI_DATA_SANITIZATION',
      resource: 'external_ai',
      outcome: 'SUCCESS',
      severity: 'MEDIUM',
      ipAddress: context.ipAddress,
      details: {
        dataType: typeof data,
        hasUserId: !!context.userId,
      },
      dataClassification: 'CONFIDENTIAL',
      complianceFlags: ['DLP', 'AI_PROCESSING'],
    });

    // Perform DLP scan and redaction
    const dlpResult = this.dlpService.scanData(data);
    
    if (!dlpResult.isClean) {
      this.dlpService.logDlpScan(dlpResult, 'external_ai_sanitization');
      
      // Log security event for violations
      await this.auditLogService.logSecurityEvent({
        type: 'DATA_BREACH',
        severity: 'MEDIUM',
        userId: context.userId,
        ipAddress: context.ipAddress,
        details: {
          violationCount: dlpResult.violations.length,
          violations: dlpResult.violations,
        },
        timestamp: new Date(),
      });
    }

    // Redact sensitive data
    const sanitized = this.dlpService.redactData(data, {
      redactPii: true,
      redactPhi: true,
      pseudonymizeIds: true,
      preserveStructure: true,
    });

    return sanitized;
  }

  /**
   * Validate API request security
   */
  async validateApiRequest(
    request: any,
    requiredPermissions: string[],
    context: SecurityContext
  ): Promise<SecurityValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check authentication
    if (!context.userId && requiredPermissions.length > 0) {
      errors.push('Authentication required for this endpoint');
    }

    // Check rate limiting headers
    if (request.headers['x-forwarded-for']) {
      // Request is behind a proxy - validate proxy configuration
      warnings.push('Request is behind a proxy - ensure proper proxy configuration');
    }

    // Validate content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        warnings.push('Unexpected content type - should be application/json');
      }
    }

    // Check for suspicious user agent
    const userAgent = request.headers['user-agent'];
    if (!userAgent || this.isSuspiciousUserAgent(userAgent)) {
      warnings.push('Suspicious or missing user agent detected');
    }

    // Validate request size
    const contentLength = parseInt(request.headers['content-length'] || '0');
    const maxSize = this.configService.get('MAX_REQUEST_SIZE', 10 * 1024 * 1024); // 10MB default
    if (contentLength > maxSize) {
      errors.push('Request size exceeds maximum allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Generate secure session token
   */
  async generateSecureSession(userId: string, deviceInfo: any): Promise<{
    sessionId: string;
    refreshToken: string;
    deviceFingerprint: string;
    expiresAt: Date;
  }> {
    const sessionId = this.encryptionService.generateSecureToken(32);
    const refreshToken = this.encryptionService.generateSecureToken(48);
    const deviceFingerprint = this.encryptionService.generateDeviceFingerprint(deviceInfo);
    
    const sessionDuration = this.configService.get('SESSION_DURATION_HOURS', 24);
    const expiresAt = new Date(Date.now() + sessionDuration * 60 * 60 * 1000);

    // Log session creation
    await this.auditLogService.logAuthEvent(
      userId,
      'LOGIN',
      'SUCCESS',
      deviceInfo.ipAddress,
      deviceInfo.userAgent,
      {
        sessionId,
        deviceFingerprint,
        expiresAt,
      }
    );

    return {
      sessionId,
      refreshToken,
      deviceFingerprint,
      expiresAt,
    };
  }

  /**
   * Validate device binding
   */
  async validateDeviceBinding(
    sessionDeviceFingerprint: string,
    currentDeviceInfo: any
  ): Promise<boolean> {
    const currentFingerprint = this.encryptionService.generateDeviceFingerprint(currentDeviceInfo);
    
    // Allow some flexibility for minor changes (screen resolution, etc.)
    const similarity = this.calculateFingerprintSimilarity(
      sessionDeviceFingerprint,
      currentFingerprint
    );

    const threshold = this.configService.get('DEVICE_BINDING_THRESHOLD', 0.8);
    
    if (similarity < threshold) {
      await this.auditLogService.logSecurityEvent({
        type: 'SUSPICIOUS_ACCESS',
        severity: 'MEDIUM',
        details: {
          reason: 'Device fingerprint mismatch',
          similarity,
          threshold,
          sessionFingerprint: sessionDeviceFingerprint,
          currentFingerprint,
        },
        timestamp: new Date(),
      });
      
      return false;
    }

    return true;
  }

  /**
   * Check for security anomalies in user behavior
   */
  async detectBehaviorAnomalies(
    userId: string,
    action: string,
    context: SecurityContext
  ): Promise<{
    isAnomalous: boolean;
    riskScore: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for unusual time access
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      reasons.push('Access outside normal hours');
      riskScore += 0.3;
    }

    // Check for rapid successive actions
    const recentActions = await this.auditLogService.getUserAuditTrail(
      userId,
      new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      new Date()
    );

    if (recentActions.length > 20) {
      reasons.push('High frequency of actions');
      riskScore += 0.4;
    }

    // Check for IP address changes
    const recentIpAddresses = new Set(
      recentActions
        .filter(log => log.ipAddress)
        .map(log => log.ipAddress)
    );

    if (recentIpAddresses.size > 2) {
      reasons.push('Multiple IP addresses detected');
      riskScore += 0.5;
    }

    // Check for privilege escalation attempts
    if (action.includes('ADMIN') || action.includes('PRIVILEGED')) {
      reasons.push('Privilege escalation attempt');
      riskScore += 0.6;
    }

    const threshold = this.configService.get('ANOMALY_THRESHOLD', 0.7);
    const isAnomalous = riskScore >= threshold;

    if (isAnomalous) {
      await this.auditLogService.logSecurityEvent({
        type: 'SUSPICIOUS_ACCESS',
        severity: riskScore > 0.8 ? 'HIGH' : 'MEDIUM',
        userId,
        ipAddress: context.ipAddress,
        details: {
          action,
          riskScore,
          reasons,
          threshold,
        },
        timestamp: new Date(),
      });
    }

    return {
      isAnomalous,
      riskScore,
      reasons,
    };
  }

  /**
   * Encrypt sensitive fields in entity before database save
   */
  async encryptEntityFields(entity: any, sensitiveFields: string[]): Promise<any> {
    const encrypted = { ...entity };

    for (const field of sensitiveFields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encryptionService.encryptForDatabase(
          encrypted[field],
          field
        );
      }
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive fields after database load
   */
  async decryptEntityFields(entity: any, sensitiveFields: string[]): Promise<any> {
    const decrypted = { ...entity };

    for (const field of sensitiveFields) {
      if (decrypted[field] && typeof decrypted[field] === 'object') {
        try {
          decrypted[field] = this.encryptionService.decryptFromDatabase(
            decrypted[field],
            field
          );
        } catch (error) {
          this.logger.error(`Failed to decrypt field ${field}`, { error: error.message });
          // Don't expose the encrypted data, return null instead
          decrypted[field] = null;
        }
      }
    }

    return decrypted;
  }

  /**
   * Validate mTLS certificate
   */
  validateMtlsCertificate(certificate: any): boolean {
    // In production, implement proper certificate validation
    // Check certificate chain, expiration, revocation status, etc.
    
    if (!certificate) {
      return false;
    }

    // Basic validation checks
    const now = new Date();
    const notBefore = new Date(certificate.valid_from);
    const notAfter = new Date(certificate.valid_to);

    if (now < notBefore || now > notAfter) {
      this.logger.warn('mTLS certificate outside validity period', {
        notBefore,
        notAfter,
        current: now,
      });
      return false;
    }

    return true;
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scanner/i,
      /curl/i,
      /wget/i,
      /python/i,
      /requests/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private calculateFingerprintSimilarity(fp1: string, fp2: string): number {
    if (fp1 === fp2) return 1;
    
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(fp1, fp2);
    const maxLength = Math.max(fp1.length, fp2.length);
    
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}