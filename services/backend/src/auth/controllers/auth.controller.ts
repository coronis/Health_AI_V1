import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthService, DeviceInfo } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { SocialAuthService } from '../services/social-auth.service';
import { TokenService } from '../services/token.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

import {
  RegisterEmailDto,
  LoginEmailDto,
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  LogoutDto,
} from '../dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly socialAuthService: SocialAuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register/email')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or user already exists' })
  async registerWithEmail(
    @Body() registerDto: RegisterEmailDto,
    @Req() request: Request,
  ) {
    const deviceInfo = this.extractDeviceInfo(request);
    
    const result = await this.authService.registerWithEmail(
      registerDto.email,
      registerDto.password,
      deviceInfo,
    );

    return {
      message: 'Registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      sessionId: result.sessionId,
    };
  }

  @Post('login/email')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginWithEmail(
    @Body() loginDto: LoginEmailDto,
    @Req() request: Request,
  ) {
    const deviceInfo = this.extractDeviceInfo(request);
    
    const result = await this.authService.loginWithEmail(
      loginDto.email,
      loginDto.password,
      deviceInfo,
    );

    return {
      message: 'Login successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
        phoneVerified: result.user.phoneVerified,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      sessionId: result.sessionId,
    };
  }

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number or rate limit exceeded' })
  async sendOtp(
    @Body() sendOtpDto: SendOtpDto,
    @Req() request: Request,
  ) {
    const deviceInfo = this.extractDeviceInfo(request);
    
    const result = await this.authService.sendOtp(sendOtpDto.phoneNumber, deviceInfo);
    
    return result;
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and login/register' })
  @ApiResponse({ status: 200, description: 'OTP verified and login successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Req() request: Request,
  ) {
    const deviceInfo = this.extractDeviceInfo(request);
    
    const result = await this.authService.verifyOtpAndLogin(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.otp,
      deviceInfo,
    );

    return {
      message: 'OTP verification successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber,
        role: result.user.role,
        phoneVerified: result.user.phoneVerified,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      sessionId: result.sessionId,
    };
  }

  @Post('otp/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Rate limit exceeded' })
  async resendOtp(
    @Body() sendOtpDto: SendOtpDto,
    @Req() request: Request,
  ) {
    const result = await this.otpService.resendOtp(sendOtpDto.phoneNumber);
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ) {
    const deviceInfo = this.extractDeviceInfo(request);
    
    const result = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      deviceInfo,
    );

    return {
      message: 'Token refreshed successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      sessionId: result.sessionId,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate session' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    const deviceInfo = this.extractDeviceInfo(request);
    
    await this.authService.logout(user.userId, logoutDto.sessionId, deviceInfo);
    
    return {
      message: 'Logout successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved' })
  async getCurrentUser(@Req() request: Request) {
    const user = request.user as any;
    
    return {
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        sessionId: user.sessionId,
      },
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active sessions for current user' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved' })
  async getActiveSessions(@Req() request: Request) {
    const user = request.user as any;
    
    const sessions = await this.tokenService.getUserActiveSessions(user.userId);
    
    return {
      sessions: sessions.map(session => ({
        sessionId: session.sessionId,
        deviceFingerprint: session.deviceFingerprint,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
        isCurrent: session.sessionId === user.sessionId,
      })),
    };
  }

  // Social Login Endpoints
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleLogin(@Res() response: Response) {
    // This would redirect to Google OAuth
    const googleAuthUrl = await this.socialAuthService.getGoogleAuthUrl();
    response.redirect(googleAuthUrl);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleCallback(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { code } = request.query;
      if (!code) {
        throw new BadRequestException('Authorization code missing');
      }

      const deviceInfo = this.extractDeviceInfo(request);
      const socialData = await this.socialAuthService.exchangeGoogleCode(code as string);
      
      const result = await this.authService.socialLogin('google', socialData, deviceInfo);
      
      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
      response.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Google OAuth callback error', error);
      response.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  @Get('apple')
  @ApiOperation({ summary: 'Initiate Apple Sign In' })
  async appleLogin(@Res() response: Response) {
    const appleAuthUrl = await this.socialAuthService.getAppleAuthUrl();
    response.redirect(appleAuthUrl);
  }

  @Post('apple/callback')
  @ApiOperation({ summary: 'Handle Apple Sign In callback' })
  async appleCallback(
    @Body() body: any,
    @Req() request: Request,
  ) {
    try {
      const deviceInfo = this.extractDeviceInfo(request);
      const socialData = await this.socialAuthService.verifyAppleToken(body.id_token);
      
      const result = await this.authService.socialLogin('apple', socialData, deviceInfo);
      
      return {
        message: 'Apple Sign In successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        sessionId: result.sessionId,
      };
    } catch (error) {
      this.logger.error('Apple Sign In callback error', error);
      throw new BadRequestException('Apple Sign In failed');
    }
  }

  private extractDeviceInfo(request: Request): DeviceInfo {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: this.getIpAddress(request),
      deviceType: this.detectDeviceType(request.headers['user-agent']),
      platform: this.detectPlatform(request.headers['user-agent']),
      language: request.headers['accept-language']?.split(',')[0],
      timezone: request.headers['x-timezone'] as string,
    };
  }

  private getIpAddress(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.socket?.remoteAddress ||
      'unknown'
    ) as string;
  }

  private detectDeviceType(userAgent?: string): 'mobile' | 'desktop' | 'tablet' {
    if (!userAgent) return 'desktop';
    
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent)) {
      if (/iPad|Tablet/i.test(userAgent)) return 'tablet';
      return 'mobile';
    }
    
    return 'desktop';
  }

  private detectPlatform(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    
    return 'unknown';
  }
}