import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface DlpRedactionOptions {
  redactPii?: boolean;
  redactPhi?: boolean;
  pseudonymizeIds?: boolean;
  preserveStructure?: boolean;
}

export interface DlpScanResult {
  isClean: boolean;
  violations: Array<{
    type: 'PII' | 'PHI' | 'SECRET' | 'ID';
    field: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    position?: { start: number; end: number };
  }>;
  redacted?: any;
}

@Injectable()
export class DlpService {
  private readonly logger = new Logger(DlpService.name);
  private readonly piiPatterns: Map<string, RegExp>;
  private readonly phiPatterns: Map<string, RegExp>;
  private readonly secretPatterns: Map<string, RegExp>;
  private readonly idPatterns: Map<string, RegExp>;

  constructor(private readonly configService: ConfigService) {
    // PII patterns (Personally Identifiable Information)
    this.piiPatterns = new Map([
      ['email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],
      ['phone_in', /(?:\+91|91)?[-\s]?[6-9]\d{9}/g], // Indian phone numbers
      ['phone_intl', /\+\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}/g],
      ['ssn', /\b\d{3}-\d{2}-\d{4}\b/g],
      ['pan_card', /[A-Z]{5}\d{4}[A-Z]/g], // Indian PAN card
      ['aadhaar', /\b\d{4}\s?\d{4}\s?\d{4}\b/g], // Indian Aadhaar
      ['credit_card', /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g],
      ['ip_address', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
    ]);

    // PHI patterns (Protected Health Information)
    this.phiPatterns = new Map([
      ['blood_pressure', /\b\d{2,3}\/\d{2,3}\s?mmHg?\b/gi],
      ['blood_sugar', /\b\d{2,3}\s?mg\/dl\b/gi],
      ['weight', /\b\d{2,3}\s?kg\b/gi],
      ['height', /\b\d{3}\s?cm\b/gi],
      ['medical_record', /\bMRN:?\s?\d+\b/gi],
      ['lab_values', /\b\d+\.?\d*\s?(mg|mcg|ng|pg)\/?(dl|ml|l)\b/gi],
    ]);

    // Secret patterns
    this.secretPatterns = new Map([
      ['api_key', /\bapi[_-]?key[_-]?[=:]\s?['"]?[a-zA-Z0-9]{20,}['"]?/gi],
      ['bearer_token', /\bbearer\s+[a-zA-Z0-9._-]{20,}/gi],
      ['jwt', /\beyJ[a-zA-Z0-9._-]{100,}/g],
      ['password', /\bpassword[_-]?[=:]\s?['"]?[^\s'"]{8,}['"]?/gi],
      ['secret', /\bsecret[_-]?[=:]\s?['"]?[a-zA-Z0-9]{20,}['"]?/gi],
    ]);

    // ID patterns
    this.idPatterns = new Map([
      ['uuid', /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi],
      ['user_id', /\buser[_-]?id[_-]?[=:]\s?['"]?[a-zA-Z0-9-]{10,}['"]?/gi],
    ]);
  }

  /**
   * Scan data for PII, PHI, secrets, and IDs
   */
  scanData(data: any, field = 'root'): DlpScanResult {
    const violations: DlpScanResult['violations'] = [];
    
    if (typeof data === 'string') {
      violations.push(...this.scanString(data, field));
    } else if (typeof data === 'object' && data !== null) {
      violations.push(...this.scanObject(data, field));
    }

    return {
      isClean: violations.length === 0,
      violations,
    };
  }

  /**
   * Redact sensitive data from payload
   */
  redactData(data: any, options: DlpRedactionOptions = {}): any {
    const {
      redactPii = true,
      redactPhi = true,
      pseudonymizeIds = true,
      preserveStructure = true,
    } = options;

    if (typeof data === 'string') {
      return this.redactString(data, { redactPii, redactPhi, pseudonymizeIds });
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.redactData(item, options));
      }

      const redacted: any = preserveStructure ? {} : {};
      
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveField(key)) {
          redacted[key] = this.redactSensitiveField(key, value, options);
        } else {
          redacted[key] = this.redactData(value, options);
        }
      }

      return redacted;
    }

    return data;
  }

  /**
   * Pseudonymize user IDs and other identifiers
   */
  pseudonymizeIdentifiers(data: any): any {
    if (typeof data === 'string') {
      let result = data;
      
      this.idPatterns.forEach((pattern, type) => {
        result = result.replace(pattern, (match) => {
          return this.generatePseudonym(match, type);
        });
      });

      return result;
    }

    if (typeof data === 'object' && data !== null) {
      const pseudonymized: any = Array.isArray(data) ? [] : {};
      
      for (const [key, value] of Object.entries(data)) {
        pseudonymized[key] = this.pseudonymizeIdentifiers(value);
      }

      return pseudonymized;
    }

    return data;
  }

  private scanString(text: string, field: string): DlpScanResult['violations'] {
    const violations: DlpScanResult['violations'] = [];

    // Scan for PII
    this.piiPatterns.forEach((pattern, type) => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        violations.push({
          type: 'PII',
          field: `${field}.${type}`,
          severity: this.getSeverity('PII', type),
          position: { start: match.index!, end: match.index! + match[0].length },
        });
      });
    });

    // Scan for PHI
    this.phiPatterns.forEach((pattern, type) => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        violations.push({
          type: 'PHI',
          field: `${field}.${type}`,
          severity: this.getSeverity('PHI', type),
          position: { start: match.index!, end: match.index! + match[0].length },
        });
      });
    });

    // Scan for secrets
    this.secretPatterns.forEach((pattern, type) => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        violations.push({
          type: 'SECRET',
          field: `${field}.${type}`,
          severity: 'CRITICAL',
          position: { start: match.index!, end: match.index! + match[0].length },
        });
      });
    });

    return violations;
  }

  private scanObject(obj: any, field: string): DlpScanResult['violations'] {
    const violations: DlpScanResult['violations'] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullField = `${field}.${key}`;
      
      if (typeof value === 'string') {
        violations.push(...this.scanString(value, fullField));
      } else if (typeof value === 'object' && value !== null) {
        violations.push(...this.scanObject(value, fullField));
      }
    }

    return violations;
  }

  private redactString(text: string, options: DlpRedactionOptions): string {
    let result = text;

    if (options.redactPii) {
      this.piiPatterns.forEach((pattern) => {
        result = result.replace(pattern, '[REDACTED_PII]');
      });
    }

    if (options.redactPhi) {
      this.phiPatterns.forEach((pattern) => {
        result = result.replace(pattern, '[REDACTED_PHI]');
      });
    }

    if (options.pseudonymizeIds) {
      this.idPatterns.forEach((pattern, type) => {
        result = result.replace(pattern, (match) => {
          return this.generatePseudonym(match, type);
        });
      });
    }

    // Always redact secrets
    this.secretPatterns.forEach((pattern) => {
      result = result.replace(pattern, '[REDACTED_SECRET]');
    });

    return result;
  }

  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password', 'secret', 'token', 'key', 'hash',
      'ssn', 'pan', 'aadhaar', 'passport',
      'medicalRecord', 'healthData', 'diagnosis',
      'email', 'phone', 'address',
    ];

    const fieldLower = fieldName.toLowerCase();
    return sensitiveFields.some(field => fieldLower.includes(field));
  }

  private redactSensitiveField(fieldName: string, value: any, options: DlpRedactionOptions): any {
    if (typeof value !== 'string') {
      return this.redactData(value, options);
    }

    const fieldLower = fieldName.toLowerCase();
    
    if (fieldLower.includes('password') || fieldLower.includes('secret') || fieldLower.includes('token')) {
      return '[REDACTED_SECRET]';
    }
    
    if (fieldLower.includes('email')) {
      return options.redactPii ? '[REDACTED_EMAIL]' : this.maskEmail(value);
    }
    
    if (fieldLower.includes('phone')) {
      return options.redactPii ? '[REDACTED_PHONE]' : this.maskPhone(value);
    }

    return this.redactString(value, options);
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '[INVALID_EMAIL]';
    
    const maskedLocal = local.length > 2 
      ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
      : '*'.repeat(local.length);
    
    return `${maskedLocal}@${domain}`;
  }

  private maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '[INVALID_PHONE]';
    
    const lastFour = digits.slice(-4);
    const masked = '*'.repeat(digits.length - 4) + lastFour;
    
    return masked;
  }

  private generatePseudonym(original: string, type: string): string {
    const hash = crypto.createHash('sha256')
      .update(original + this.configService.get('DLP_SALT', 'default-salt'))
      .digest('hex');
    
    return `[PSEUDO_${type.toUpperCase()}_${hash.substring(0, 8)}]`;
  }

  private getSeverity(violationType: string, subType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (violationType === 'SECRET') return 'CRITICAL';
    if (violationType === 'PHI') return 'HIGH';
    
    if (violationType === 'PII') {
      const highRiskPii = ['ssn', 'pan_card', 'aadhaar', 'credit_card'];
      return highRiskPii.includes(subType) ? 'HIGH' : 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Check if external AI vendor has no-retention enabled
   */
  validateVendorRetentionPolicy(vendorConfig: any): boolean {
    const requiredSettings = [
      'no_log', 'no_retention', 'ephemeral', 'zero_retention'
    ];

    return requiredSettings.some(setting => 
      vendorConfig[setting] === true || 
      vendorConfig[setting] === 'true' ||
      vendorConfig[setting] === 'enabled'
    );
  }

  /**
   * Log DLP scan results for audit
   */
  logDlpScan(result: DlpScanResult, context: string): void {
    if (!result.isClean) {
      this.logger.warn(`DLP scan failed for ${context}`, {
        violationCount: result.violations.length,
        violations: result.violations.map(v => ({
          type: v.type,
          field: v.field,
          severity: v.severity,
        })),
      });
    } else {
      this.logger.debug(`DLP scan passed for ${context}`);
    }
  }
}