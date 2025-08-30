import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AuditLogEntry {
  id?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  details?: Record<string, any>;
  dataClassification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  complianceFlags?: string[];
}

export interface SecurityAnomalyEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACCESS' | 'DATA_BREACH' | 'PRIVILEGE_ESCALATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ipAddress?: string;
  details: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly auditLogs: AuditLogEntry[] = []; // In production, this would be a database
  private readonly securityEvents: SecurityAnomalyEvent[] = [];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Log user action for audit trail
   */
  async logUserAction(entry: Omit<AuditLogEntry, 'timestamp' | 'id'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    // Store audit log (in production, save to database)
    this.auditLogs.push(auditEntry);

    // Log to application logs
    this.logger.log('User action audited', {
      userId: auditEntry.userId,
      action: auditEntry.action,
      resource: auditEntry.resource,
      outcome: auditEntry.outcome,
      severity: auditEntry.severity,
    });

    // Check for security anomalies
    await this.analyzeForAnomalies(auditEntry);
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED',
    outcome: 'SUCCESS' | 'FAILURE',
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logUserAction({
      userId,
      action,
      resource: 'authentication',
      outcome,
      severity: outcome === 'FAILURE' ? 'MEDIUM' : 'LOW',
      ipAddress,
      userAgent,
      details,
      dataClassification: 'RESTRICTED',
      complianceFlags: ['AUTH_AUDIT'],
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    userId: string,
    action: 'READ' | 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    dataClassification: AuditLogEntry['dataClassification'] = 'INTERNAL',
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = this.getSeverityForDataAccess(action, dataClassification);
    
    await this.logUserAction({
      userId,
      action: action.toUpperCase(),
      resource,
      resourceId,
      outcome: 'SUCCESS',
      severity,
      ipAddress,
      details,
      dataClassification,
      complianceFlags: this.getComplianceFlags(action, dataClassification),
    });
  }

  /**
   * Log security events and anomalies
   */
  async logSecurityEvent(event: SecurityAnomalyEvent): Promise<void> {
    this.securityEvents.push(event);

    this.logger.warn('Security anomaly detected', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details,
    });

    // Trigger alerts for high/critical severity events
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      await this.triggerSecurityAlert(event);
    }
  }

  /**
   * Log API access with rate limiting context
   */
  async logApiAccess(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity = statusCode >= 500 ? 'HIGH' : statusCode >= 400 ? 'MEDIUM' : 'LOW';
    const outcome = statusCode < 400 ? 'SUCCESS' : 'FAILURE';

    await this.logUserAction({
      userId,
      action: `${method}_${endpoint}`,
      resource: 'api',
      outcome,
      severity,
      ipAddress,
      userAgent,
      details: {
        endpoint,
        method,
        statusCode,
        responseTime,
      },
      dataClassification: 'INTERNAL',
    });
  }

  /**
   * Log health data access (PHI/PII)
   */
  async logHealthDataAccess(
    userId: string,
    action: string,
    healthDataType: string,
    resourceId?: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logUserAction({
      userId,
      action,
      resource: `health_data.${healthDataType}`,
      resourceId,
      outcome: 'SUCCESS',
      severity: 'HIGH', // Health data access is always high severity
      ipAddress,
      details,
      dataClassification: 'RESTRICTED',
      complianceFlags: ['HIPAA', 'PHI_ACCESS', 'HEALTH_AUDIT'],
    });
  }

  /**
   * Get audit trail for a specific user
   */
  async getUserAuditTrail(
    userId: string, 
    fromDate?: Date, 
    toDate?: Date,
    actions?: string[]
  ): Promise<AuditLogEntry[]> {
    let filtered = this.auditLogs.filter(log => log.userId === userId);

    if (fromDate) {
      filtered = filtered.filter(log => log.timestamp >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter(log => log.timestamp <= toDate);
    }

    if (actions && actions.length > 0) {
      filtered = filtered.filter(log => actions.includes(log.action));
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get security events by type and severity
   */
  async getSecurityEvents(
    type?: SecurityAnomalyEvent['type'],
    severity?: SecurityAnomalyEvent['severity'],
    fromDate?: Date,
    toDate?: Date
  ): Promise<SecurityAnomalyEvent[]> {
    let filtered = this.securityEvents;

    if (type) {
      filtered = filtered.filter(event => event.type === type);
    }

    if (severity) {
      filtered = filtered.filter(event => event.severity === severity);
    }

    if (fromDate) {
      filtered = filtered.filter(event => event.timestamp >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter(event => event.timestamp <= toDate);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    fromDate: Date,
    toDate: Date,
    complianceStandard: 'HIPAA' | 'GDPR' | 'SOX' | 'ALL' = 'ALL'
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    securityEvents: number;
    dataAccessEvents: number;
    authEvents: number;
    anomalies: SecurityAnomalyEvent[];
  }> {
    const filtered = this.auditLogs.filter(
      log => log.timestamp >= fromDate && log.timestamp <= toDate
    );

    const complianceFiltered = complianceStandard === 'ALL' 
      ? filtered 
      : filtered.filter(log => log.complianceFlags?.includes(complianceStandard));

    const eventsByType = complianceFiltered.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const securityEvents = this.securityEvents.filter(
      event => event.timestamp >= fromDate && event.timestamp <= toDate
    );

    return {
      totalEvents: complianceFiltered.length,
      eventsByType,
      securityEvents: securityEvents.length,
      dataAccessEvents: complianceFiltered.filter(log => 
        ['READ', 'CREATE', 'UPDATE', 'DELETE'].includes(log.action)
      ).length,
      authEvents: complianceFiltered.filter(log => 
        log.resource === 'authentication'
      ).length,
      anomalies: securityEvents.filter(event => 
        event.severity === 'HIGH' || event.severity === 'CRITICAL'
      ),
    };
  }

  private async analyzeForAnomalies(entry: AuditLogEntry): Promise<void> {
    // Check for suspicious authentication patterns
    if (entry.resource === 'authentication' && entry.outcome === 'FAILURE') {
      await this.checkForBruteForceAttack(entry);
    }

    // Check for unusual data access patterns
    if (entry.dataClassification === 'RESTRICTED' || entry.dataClassification === 'CONFIDENTIAL') {
      await this.checkForUnusualDataAccess(entry);
    }

    // Check for privilege escalation attempts
    if (entry.action.includes('ADMIN') || entry.action.includes('PRIVILEGED')) {
      await this.checkForPrivilegeEscalation(entry);
    }
  }

  private async checkForBruteForceAttack(entry: AuditLogEntry): Promise<void> {
    const recentFailures = this.auditLogs.filter(log => 
      log.userId === entry.userId &&
      log.resource === 'authentication' &&
      log.outcome === 'FAILURE' &&
      log.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    );

    if (recentFailures.length >= 5) {
      await this.logSecurityEvent({
        type: 'AUTH_FAILURE',
        severity: 'HIGH',
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        details: {
          failureCount: recentFailures.length,
          timeWindow: '15 minutes',
        },
        timestamp: new Date(),
      });
    }
  }

  private async checkForUnusualDataAccess(entry: AuditLogEntry): Promise<void> {
    // Check for access outside normal hours
    const hour = entry.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACCESS',
        severity: 'MEDIUM',
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        details: {
          reason: 'Access outside normal hours',
          hour,
          resource: entry.resource,
        },
        timestamp: new Date(),
      });
    }

    // Check for bulk data access
    const recentAccess = this.auditLogs.filter(log =>
      log.userId === entry.userId &&
      log.dataClassification === entry.dataClassification &&
      log.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    if (recentAccess.length >= 50) {
      await this.logSecurityEvent({
        type: 'SUSPICIOUS_ACCESS',
        severity: 'HIGH',
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        details: {
          reason: 'Bulk data access detected',
          accessCount: recentAccess.length,
          timeWindow: '1 hour',
        },
        timestamp: new Date(),
      });
    }
  }

  private async checkForPrivilegeEscalation(entry: AuditLogEntry): Promise<void> {
    await this.logSecurityEvent({
      type: 'PRIVILEGE_ESCALATION',
      severity: 'HIGH',
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      details: {
        action: entry.action,
        resource: entry.resource,
        outcome: entry.outcome,
      },
      timestamp: new Date(),
    });
  }

  private async triggerSecurityAlert(event: SecurityAnomalyEvent): Promise<void> {
    // In production, this would send alerts to security team
    this.logger.error('SECURITY ALERT', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details,
    });

    // Could integrate with external alerting systems:
    // - Slack/Teams notifications
    // - Email alerts
    // - SIEM systems
    // - Incident management tools
  }

  private getSeverityForDataAccess(
    action: string, 
    classification: AuditLogEntry['dataClassification']
  ): AuditLogEntry['severity'] {
    if (classification === 'RESTRICTED') return 'HIGH';
    if (classification === 'CONFIDENTIAL') return 'MEDIUM';
    if (action === 'delete') return 'MEDIUM';
    return 'LOW';
  }

  private getComplianceFlags(
    action: string, 
    classification: AuditLogEntry['dataClassification']
  ): string[] {
    const flags: string[] = [];

    if (classification === 'RESTRICTED') {
      flags.push('HIPAA', 'PHI_ACCESS');
    }

    if (['update', 'delete'].includes(action)) {
      flags.push('DATA_MODIFICATION');
    }

    if (classification === 'CONFIDENTIAL' || classification === 'RESTRICTED') {
      flags.push('GDPR', 'PII_ACCESS');
    }

    return flags;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}