import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EncryptionOptions {
  algorithm?: string;
  keyDerivationIterations?: number;
  ivLength?: number;
  saltLength?: number;
  tagLength?: number;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  tag?: string;
  algorithm: string;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly defaultAlgorithm = 'aes-256-gcm';
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const masterKeyString = this.configService.get('ENCRYPTION_MASTER_KEY', 'demo-master-key-replace-in-production');
    this.masterKey = this.deriveKey(masterKeyString);
  }

  /**
   * Encrypt sensitive data with AES-256-GCM
   */
  encrypt(data: string, options: EncryptionOptions = {}): EncryptedData {
    const {
      algorithm = this.defaultAlgorithm,
      ivLength = 16,
      saltLength = 32,
      keyDerivationIterations = 100000,
    } = options;

    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(saltLength);
      const iv = crypto.randomBytes(ivLength);
      
      // Derive encryption key
      const derivedKey = crypto.pbkdf2Sync(this.masterKey, salt, keyDerivationIterations, 32, 'sha256');
      
      // Create cipher
      const cipher = crypto.createCipher(algorithm, derivedKey);
      cipher.setAutoPadding(true);
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag for GCM mode
      let tag: string | undefined;
      if (algorithm.includes('gcm')) {
        tag = cipher.getAuthTag().toString('hex');
      }

      return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag,
        algorithm,
      };
    } catch (error) {
      this.logger.error('Encryption failed', { error: error.message });
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: EncryptedData): string {
    const { encrypted, iv, salt, tag, algorithm } = encryptedData;

    try {
      // Reconstruct buffers
      const ivBuffer = Buffer.from(iv, 'hex');
      const saltBuffer = Buffer.from(salt, 'hex');
      const encryptedBuffer = Buffer.from(encrypted, 'hex');
      
      // Derive decryption key
      const derivedKey = crypto.pbkdf2Sync(this.masterKey, saltBuffer, 100000, 32, 'sha256');
      
      // Create decipher
      const decipher = crypto.createDecipher(algorithm, derivedKey);
      
      // Set auth tag for GCM mode
      if (algorithm.includes('gcm') && tag) {
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
      }
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', { error: error.message });
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt object fields that are marked as sensitive
   */
  encryptSensitiveFields(data: any, sensitiveFields: string[]): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const encrypted = { ...data };

    for (const field of sensitiveFields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    }

    return encrypted;
  }

  /**
   * Decrypt object fields that are encrypted
   */
  decryptSensitiveFields(data: any, sensitiveFields: string[]): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const decrypted = { ...data };

    for (const field of sensitiveFields) {
      if (decrypted[field] && this.isEncryptedData(decrypted[field])) {
        decrypted[field] = this.decrypt(decrypted[field]);
      }
    }

    return decrypted;
  }

  /**
   * Hash password with bcrypt-like security
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get('PASSWORD_SALT_ROUNDS', 12);
    const salt = crypto.randomBytes(16).toString('hex');
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, saltRounds * 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    const saltRounds = this.configService.get('PASSWORD_SALT_ROUNDS', 12);
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, saltRounds * 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint(deviceInfo: any): string {
    const fingerprint = [
      deviceInfo.userAgent,
      deviceInfo.screenResolution,
      deviceInfo.timezone,
      deviceInfo.language,
      deviceInfo.platform,
    ].join('|');

    return crypto.createHash('sha256').update(fingerprint).digest('hex');
  }

  /**
   * Create HMAC signature for data integrity
   */
  createHmacSignature(data: string, secret?: string): string {
    const hmacSecret = secret || this.configService.get('HMAC_SECRET', 'demo-hmac-secret');
    return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHmacSignature(data: string, signature: string, secret?: string): boolean {
    const expectedSignature = this.createHmacSignature(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Encrypt data for database storage (field-level encryption)
   */
  encryptForDatabase(value: string, fieldName: string): EncryptedData {
    // Use field-specific key derivation for additional security
    const fieldKey = crypto.createHash('sha256')
      .update(this.masterKey)
      .update(fieldName)
      .digest();

    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(32);
    
    const derivedKey = crypto.pbkdf2Sync(fieldKey, salt, 100000, 32, 'sha256');
    const cipher = crypto.createCipher(algorithm, derivedKey);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag,
      algorithm,
    };
  }

  /**
   * Decrypt data from database
   */
  decryptFromDatabase(encryptedData: EncryptedData, fieldName: string): string {
    const fieldKey = crypto.createHash('sha256')
      .update(this.masterKey)
      .update(fieldName)
      .digest();

    const { encrypted, iv, salt, tag, algorithm } = encryptedData;
    const ivBuffer = Buffer.from(iv, 'hex');
    const saltBuffer = Buffer.from(salt, 'hex');
    
    const derivedKey = crypto.pbkdf2Sync(fieldKey, saltBuffer, 100000, 32, 'sha256');
    const decipher = crypto.createDecipher(algorithm, derivedKey);
    
    if (tag) {
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
    }
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Key rotation support
   */
  rotateEncryption(oldEncryptedData: EncryptedData, fieldName?: string): EncryptedData {
    // Decrypt with old key
    const decrypted = fieldName 
      ? this.decryptFromDatabase(oldEncryptedData, fieldName)
      : this.decrypt(oldEncryptedData);
    
    // Re-encrypt with current key
    return fieldName 
      ? this.encryptForDatabase(decrypted, fieldName)
      : this.encrypt(decrypted);
  }

  private deriveKey(keyString: string): Buffer {
    return crypto.createHash('sha256').update(keyString).digest();
  }

  private isEncryptedData(value: any): value is EncryptedData {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof value.encrypted === 'string' &&
      typeof value.iv === 'string' &&
      typeof value.salt === 'string' &&
      typeof value.algorithm === 'string'
    );
  }

  /**
   * Check if encryption is properly configured
   */
  validateConfiguration(): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    const masterKey = this.configService.get('ENCRYPTION_MASTER_KEY');
    if (!masterKey || masterKey === 'demo-master-key-replace-in-production') {
      warnings.push('Using demo master key - replace in production');
    }

    const hmacSecret = this.configService.get('HMAC_SECRET');
    if (!hmacSecret || hmacSecret === 'demo-hmac-secret') {
      warnings.push('Using demo HMAC secret - replace in production');
    }

    const isValid = warnings.length === 0;
    
    if (!isValid) {
      this.logger.warn('Encryption configuration warnings', { warnings });
    }

    return { isValid, warnings };
  }
}