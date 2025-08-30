import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OtpResult {
  success: boolean;
  expiresIn: number;
  retryAfter?: number;
}

export interface OtpAttempt {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpStorage = new Map<string, OtpAttempt>(); // In production, use Redis
  private readonly rateLimitStorage = new Map<string, number[]>(); // Track OTP requests

  constructor(private readonly configService: ConfigService) {
    // Clean up expired OTPs every 5 minutes
    setInterval(() => this.cleanupExpiredOtps(), 5 * 60 * 1000);
  }

  /**
   * Generate and send OTP to phone number
   */
  async generateAndSendOtp(phoneNumber: string): Promise<OtpResult> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    
    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit(normalizedPhone);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        expiresIn: 0,
        retryAfter: rateLimitCheck.retryAfter,
      };
    }

    // Generate OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.getOtpExpirationTime());

    // Store OTP
    this.otpStorage.set(normalizedPhone, {
      phoneNumber: normalizedPhone,
      otp,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    });

    // Send OTP via SMS
    const sent = await this.sendSms(normalizedPhone, otp);
    
    if (sent) {
      this.updateRateLimit(normalizedPhone);
      
      this.logger.log(`OTP sent to ${this.maskPhoneNumber(normalizedPhone)}`);
      
      return {
        success: true,
        expiresIn: this.getOtpExpirationTime() / 1000, // Return in seconds
      };
    } else {
      this.otpStorage.delete(normalizedPhone);
      return {
        success: false,
        expiresIn: 0,
      };
    }
  }

  /**
   * Verify OTP for phone number
   */
  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const storedOtp = this.otpStorage.get(normalizedPhone);

    if (!storedOtp) {
      this.logger.warn(`OTP verification failed - no OTP found for ${this.maskPhoneNumber(normalizedPhone)}`);
      return false;
    }

    // Check if OTP is expired
    if (new Date() > storedOtp.expiresAt) {
      this.otpStorage.delete(normalizedPhone);
      this.logger.warn(`OTP verification failed - expired for ${this.maskPhoneNumber(normalizedPhone)}`);
      return false;
    }

    // Check if too many attempts
    if (storedOtp.attempts >= this.getMaxOtpAttempts()) {
      this.otpStorage.delete(normalizedPhone);
      this.logger.warn(`OTP verification failed - max attempts exceeded for ${this.maskPhoneNumber(normalizedPhone)}`);
      return false;
    }

    // Increment attempts
    storedOtp.attempts += 1;

    // Verify OTP
    const isValid = storedOtp.otp === otp;
    
    if (isValid) {
      // Remove OTP after successful verification
      this.otpStorage.delete(normalizedPhone);
      this.logger.log(`OTP verified successfully for ${this.maskPhoneNumber(normalizedPhone)}`);
    } else {
      this.logger.warn(`OTP verification failed - invalid code for ${this.maskPhoneNumber(normalizedPhone)} (attempt ${storedOtp.attempts})`);
    }

    return isValid;
  }

  /**
   * Get number of recent OTP requests for rate limiting
   */
  async getRecentOtpRequests(phoneNumber: string): Promise<number> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const requests = this.rateLimitStorage.get(normalizedPhone) || [];
    const windowStart = Date.now() - this.getRateLimitWindow();
    
    return requests.filter(timestamp => timestamp > windowStart).length;
  }

  /**
   * Resend OTP (with different rate limiting)
   */
  async resendOtp(phoneNumber: string): Promise<OtpResult> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const storedOtp = this.otpStorage.get(normalizedPhone);

    // Check if there's an existing OTP that's still valid for resend
    if (storedOtp) {
      const timeSinceCreated = Date.now() - storedOtp.createdAt.getTime();
      const minResendInterval = this.getMinResendInterval();

      if (timeSinceCreated < minResendInterval) {
        return {
          success: false,
          expiresIn: 0,
          retryAfter: Math.ceil((minResendInterval - timeSinceCreated) / 1000),
        };
      }
    }

    // Generate new OTP
    return this.generateAndSendOtp(phoneNumber);
  }

  /**
   * Send SMS with OTP
   */
  private async sendSms(phoneNumber: string, otp: string): Promise<boolean> {
    const smsProvider = this.configService.get('SMS_PROVIDER', 'demo');
    
    try {
      switch (smsProvider) {
        case 'twilio':
          return this.sendViaTwilio(phoneNumber, otp);
        case 'aws-sns':
          return this.sendViaAwsSns(phoneNumber, otp);
        case 'msg91':
          return this.sendViaMsg91(phoneNumber, otp);
        case 'demo':
          return this.sendViaDemo(phoneNumber, otp);
        default:
          this.logger.error(`Unknown SMS provider: ${smsProvider}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${this.maskPhoneNumber(phoneNumber)}`, {
        error: error.message,
        provider: smsProvider,
      });
      return false;
    }
  }

  private async sendViaTwilio(phoneNumber: string, otp: string): Promise<boolean> {
    // Implementation for Twilio SMS
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.get('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      this.logger.error('Twilio configuration missing');
      return false;
    }

    // In production, use Twilio SDK
    const message = `Your HealthCoachAI verification code is: ${otp}. Valid for 5 minutes.`;
    
    this.logger.log(`[DEMO] Would send Twilio SMS to ${this.maskPhoneNumber(phoneNumber)}: ${message}`);
    return true;
  }

  private async sendViaAwsSns(phoneNumber: string, otp: string): Promise<boolean> {
    // Implementation for AWS SNS
    const region = this.configService.get('AWS_SMS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    if (!region || !accessKeyId || !secretAccessKey) {
      this.logger.error('AWS SNS configuration missing');
      return false;
    }

    const message = `Your HealthCoachAI verification code is: ${otp}. Valid for 5 minutes.`;
    
    this.logger.log(`[DEMO] Would send AWS SNS to ${this.maskPhoneNumber(phoneNumber)}: ${message}`);
    return true;
  }

  private async sendViaMsg91(phoneNumber: string, otp: string): Promise<boolean> {
    // Implementation for MSG91 (popular in India)
    const authKey = this.configService.get('MSG91_AUTH_KEY');
    const templateId = this.configService.get('MSG91_TEMPLATE_ID');
    const senderId = this.configService.get('MSG91_SENDER_ID');

    if (!authKey || !templateId || !senderId) {
      this.logger.error('MSG91 configuration missing');
      return false;
    }

    const message = `Your HealthCoachAI verification code is: ${otp}. Valid for 5 minutes.`;
    
    this.logger.log(`[DEMO] Would send MSG91 SMS to ${this.maskPhoneNumber(phoneNumber)}: ${message}`);
    return true;
  }

  private async sendViaDemo(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your HealthCoachAI verification code is: ${otp}. Valid for 5 minutes.`;
    
    this.logger.log(`[DEMO SMS] To: ${this.maskPhoneNumber(phoneNumber)}, Message: ${message}`);
    
    // In demo mode, always succeed but log the OTP for testing
    console.log(`🔐 OTP for ${this.maskPhoneNumber(phoneNumber)}: ${otp}`);
    
    return true;
  }

  private generateOtp(): string {
    const length = this.configService.get('OTP_LENGTH', 6);
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let normalized = phoneNumber.replace(/\D/g, '');
    
    // Handle Indian phone numbers
    if (normalized.startsWith('91') && normalized.length === 12) {
      // Remove country code
      normalized = normalized.substring(2);
    } else if (normalized.startsWith('+91')) {
      normalized = normalized.substring(3);
    }
    
    return normalized;
  }

  private checkRateLimit(phoneNumber: string): { allowed: boolean; retryAfter?: number } {
    const requests = this.rateLimitStorage.get(phoneNumber) || [];
    const windowStart = Date.now() - this.getRateLimitWindow();
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    const maxRequests = this.getMaxOtpRequestsPerWindow();
    
    if (recentRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil((oldestRequest + this.getRateLimitWindow() - Date.now()) / 1000);
      
      return { allowed: false, retryAfter };
    }
    
    return { allowed: true };
  }

  private updateRateLimit(phoneNumber: string): void {
    const requests = this.rateLimitStorage.get(phoneNumber) || [];
    const windowStart = Date.now() - this.getRateLimitWindow();
    
    // Remove old requests and add current
    const updatedRequests = requests
      .filter(timestamp => timestamp > windowStart)
      .concat(Date.now());
    
    this.rateLimitStorage.set(phoneNumber, updatedRequests);
  }

  private cleanupExpiredOtps(): void {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [phoneNumber, otpAttempt] of this.otpStorage.entries()) {
      if (now > otpAttempt.expiresAt) {
        this.otpStorage.delete(phoneNumber);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired OTPs`);
    }
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 4) return '****';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
  }

  private getOtpExpirationTime(): number {
    return this.configService.get('OTP_EXPIRATION_MINUTES', 5) * 60 * 1000;
  }

  private getMaxOtpAttempts(): number {
    return this.configService.get('OTP_MAX_ATTEMPTS', 3);
  }

  private getRateLimitWindow(): number {
    return this.configService.get('OTP_RATE_LIMIT_WINDOW_MINUTES', 60) * 60 * 1000;
  }

  private getMaxOtpRequestsPerWindow(): number {
    return this.configService.get('OTP_MAX_REQUESTS_PER_WINDOW', 5);
  }

  private getMinResendInterval(): number {
    return this.configService.get('OTP_MIN_RESEND_INTERVAL_SECONDS', 30) * 1000;
  }
}