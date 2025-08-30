import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { User, UserStatus } from '../../domains/users/entities/user.entity';
import { UserProfile } from '../../domains/users/entities/user-profile.entity';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { EncryptionService } from '../../security/services/encryption.service';
import { AuditLogService } from '../../security/services/audit-log.service';
import { SecurityService } from '../../security/services/security.service';

export interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password?: string;
  otp?: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
}

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  platform?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly encryptionService: EncryptionService,
    private readonly auditLogService: AuditLogService,
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register new user with email and password
   */
  async registerWithEmail(
    email: string,
    password: string,
    deviceInfo: DeviceInfo
  ): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user
    const passwordHash = await this.encryptionService.hashPassword(password);
    const user = this.userRepository.create({
      email,
      passwordHash,
      status: UserStatus.ACTIVE,
      emailVerified: false, // Will be verified via email
    });

    const savedUser = await this.userRepository.save(user);

    // Create basic profile
    const profile = this.userProfileRepository.create({
      userId: savedUser.id,
      firstName: '',
      lastName: '',
      onboardingCompleted: false,
      onboardingStep: 0,
    });

    await this.userProfileRepository.save(profile);

    // Log registration
    await this.auditLogService.logAuthEvent(
      savedUser.id,
      'LOGIN',
      'SUCCESS',
      deviceInfo.ipAddress,
      deviceInfo.userAgent,
      { registrationMethod: 'email', emailVerified: false }
    );

    // Generate tokens and session
    return this.generateAuthResult(savedUser, deviceInfo);
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(
    email: string,
    password: string,
    deviceInfo: DeviceInfo
  ): Promise<AuthResult> {
    const user = await this.validateEmailPassword(email, password, deviceInfo);
    return this.generateAuthResult(user, deviceInfo);
  }

  /**
   * Send OTP to phone number
   */
  async sendOtp(phoneNumber: string, deviceInfo: DeviceInfo): Promise<{ message: string; expiresIn: number }> {
    // Validate phone number format
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Check rate limiting for OTP requests
    const recentOtpRequests = await this.otpService.getRecentOtpRequests(phoneNumber);
    if (recentOtpRequests >= 5) {
      throw new BadRequestException('Too many OTP requests. Please try again later.');
    }

    // Generate and send OTP
    const otpResult = await this.otpService.generateAndSendOtp(phoneNumber);

    // Log OTP request
    await this.auditLogService.logUserAction({
      action: 'OTP_REQUESTED',
      resource: 'authentication',
      outcome: 'SUCCESS',
      severity: 'LOW',
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      details: {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        expiresIn: otpResult.expiresIn,
      },
    });

    return {
      message: 'OTP sent successfully',
      expiresIn: otpResult.expiresIn,
    };
  }

  /**
   * Verify OTP and login/register
   */
  async verifyOtpAndLogin(
    phoneNumber: string,
    otp: string,
    deviceInfo: DeviceInfo
  ): Promise<AuthResult> {
    // Verify OTP
    const isValidOtp = await this.otpService.verifyOtp(phoneNumber, otp);
    if (!isValidOtp) {
      await this.auditLogService.logAuthEvent(
        undefined,
        'LOGIN_FAILED',
        'FAILURE',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { reason: 'Invalid OTP', phoneNumber: this.maskPhoneNumber(phoneNumber) }
      );
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find or create user
    let user = await this.userRepository.findOne({ where: { phoneNumber } });
    
    if (!user) {
      // Create new user
      user = this.userRepository.create({
        phoneNumber,
        email: `${phoneNumber}@phone.local`, // Temporary email for phone-only users
        status: UserStatus.ACTIVE,
        phoneVerified: true,
      });

      user = await this.userRepository.save(user);

      // Create basic profile
      const profile = this.userProfileRepository.create({
        userId: user.id,
        firstName: '',
        lastName: '',
        onboardingCompleted: false,
        onboardingStep: 0,
      });

      await this.userProfileRepository.save(profile);

      await this.auditLogService.logAuthEvent(
        user.id,
        'LOGIN',
        'SUCCESS',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { registrationMethod: 'phone_otp', phoneVerified: true }
      );
    } else {
      // Update phone verification status
      user.phoneVerified = true;
      await this.userRepository.save(user);

      await this.auditLogService.logAuthEvent(
        user.id,
        'LOGIN',
        'SUCCESS',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { loginMethod: 'phone_otp' }
      );
    }

    return this.generateAuthResult(user, deviceInfo);
  }

  /**
   * Social login (Google, Apple, Facebook)
   */
  async socialLogin(
    provider: 'google' | 'apple' | 'facebook',
    socialData: any,
    deviceInfo: DeviceInfo
  ): Promise<AuthResult> {
    const { email, firstName, lastName, socialId } = socialData;

    // Find user by email or social ID
    let user = await this.userRepository.findOne({ 
      where: [
        { email },
        // Could store social IDs in a separate table
      ]
    });

    if (!user) {
      // Create new user from social login
      user = this.userRepository.create({
        email,
        status: UserStatus.ACTIVE,
        emailVerified: true, // Social providers verify emails
      });

      user = await this.userRepository.save(user);

      // Create profile with social data
      const profile = this.userProfileRepository.create({
        userId: user.id,
        firstName: firstName || '',
        lastName: lastName || '',
        onboardingCompleted: false,
        onboardingStep: 0,
      });

      await this.userProfileRepository.save(profile);

      await this.auditLogService.logAuthEvent(
        user.id,
        'LOGIN',
        'SUCCESS',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { registrationMethod: `social_${provider}`, emailVerified: true }
      );
    } else {
      await this.auditLogService.logAuthEvent(
        user.id,
        'LOGIN',
        'SUCCESS',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { loginMethod: `social_${provider}` }
      );
    }

    return this.generateAuthResult(user, deviceInfo);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string, deviceInfo: DeviceInfo): Promise<AuthResult> {
    const tokenData = await this.tokenService.verifyRefreshToken(refreshToken);
    
    const user = await this.userRepository.findOne({ 
      where: { id: tokenData.userId },
      relations: ['profile']
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Validate device binding
    const isValidDevice = await this.securityService.validateDeviceBinding(
      tokenData.deviceFingerprint,
      deviceInfo
    );

    if (!isValidDevice) {
      throw new UnauthorizedException('Device binding validation failed');
    }

    // Generate new tokens
    return this.generateAuthResult(user, deviceInfo, tokenData.sessionId);
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(userId: string, sessionId: string, deviceInfo: DeviceInfo): Promise<void> {
    await this.tokenService.invalidateSession(sessionId);

    await this.auditLogService.logAuthEvent(
      userId,
      'LOGOUT',
      'SUCCESS',
      deviceInfo.ipAddress,
      deviceInfo.userAgent,
      { sessionId }
    );
  }

  /**
   * Validate user credentials for email/password login
   */
  private async validateEmailPassword(
    email: string,
    password: string,
    deviceInfo: DeviceInfo
  ): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['profile']
    });

    if (!user) {
      await this.auditLogService.logAuthEvent(
        undefined,
        'LOGIN_FAILED',
        'FAILURE',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { reason: 'User not found', email }
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is locked
    if (user.isLocked()) {
      await this.auditLogService.logAuthEvent(
        user.id,
        'LOGIN_FAILED',
        'FAILURE',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { reason: 'Account locked', lockedUntil: user.lockedUntil }
      );
      throw new UnauthorizedException('Account is temporarily locked');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      await this.auditLogService.logAuthEvent(
        user.id,
        'LOGIN_FAILED',
        'FAILURE',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { reason: 'Account inactive', status: user.status }
      );
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Password login not available for this account');
    }

    const isValidPassword = await this.encryptionService.verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lock(30); // Lock for 30 minutes
        await this.auditLogService.logAuthEvent(
          user.id,
          'ACCOUNT_LOCKED',
          'SUCCESS',
          deviceInfo.ipAddress,
          deviceInfo.userAgent,
          { failedAttempts: user.failedLoginAttempts }
        );
      }

      await this.userRepository.save(user);

      await this.auditLogService.logAuthEvent(
        user.id,
        'LOGIN_FAILED',
        'FAILURE',
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        { reason: 'Invalid password', failedAttempts: user.failedLoginAttempts }
      );

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await this.userRepository.save(user);

    return user;
  }

  /**
   * Generate complete auth result with tokens and session
   */
  private async generateAuthResult(
    user: User,
    deviceInfo: DeviceInfo,
    existingSessionId?: string
  ): Promise<AuthResult> {
    // Generate session
    const session = existingSessionId
      ? { sessionId: existingSessionId, deviceFingerprint: '', refreshToken: '', expiresAt: new Date() }
      : await this.securityService.generateSecureSession(user.id, deviceInfo);

    // Generate JWT tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.sessionId,
      deviceFingerprint: session.deviceFingerprint,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = existingSessionId 
      ? await this.tokenService.generateRefreshToken(user.id, session.sessionId, session.deviceFingerprint)
      : session.refreshToken;

    const expiresIn = this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m');
    const expiresInSeconds = this.parseExpirationTime(expiresIn);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
      sessionId: session.sessionId,
    };
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Indian phone number validation
    const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return indianPhoneRegex.test(phoneNumber.replace(/\s|-/g, ''));
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 4) return '****';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
  }

  private parseExpirationTime(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900; // 15 minutes default
    }
  }
}