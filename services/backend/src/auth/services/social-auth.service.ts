import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface SocialUserData {
  email: string;
  firstName: string;
  lastName: string;
  socialId: string;
  picture?: string;
}

@Injectable()
export class SocialAuthService {
  private readonly logger = new Logger(SocialAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get Google OAuth authorization URL
   */
  async getGoogleAuthUrl(): Promise<string> {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID', 'demo-google-client-id');
    const redirectUri = this.configService.get('GOOGLE_CALLBACK_URL', 'http://localhost:8080/auth/google/callback');
    const scope = 'email profile';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange Google authorization code for user data
   */
  async exchangeGoogleCode(code: string): Promise<SocialUserData> {
    try {
      const clientId = this.configService.get('GOOGLE_CLIENT_ID', 'demo-google-client-id');
      const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET', 'demo-google-client-secret');
      const redirectUri = this.configService.get('GOOGLE_CALLBACK_URL', 'http://localhost:8080/auth/google/callback');

      // Exchange code for access token
      const tokenResponse = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        })
      );

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await firstValueFrom(
        this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
      );

      const profile = profileResponse.data;

      return {
        email: profile.email,
        firstName: profile.given_name || '',
        lastName: profile.family_name || '',
        socialId: profile.id,
        picture: profile.picture,
      };
    } catch (error) {
      this.logger.error('Google OAuth error', { error: error.message });
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Get Apple Sign In authorization URL
   */
  async getAppleAuthUrl(): Promise<string> {
    const clientId = this.configService.get('APPLE_CLIENT_ID', 'demo-apple-client-id');
    const redirectUri = this.configService.get('APPLE_CALLBACK_URL', 'http://localhost:8080/auth/apple/callback');
    const scope = 'name email';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: 'code id_token',
      response_mode: 'form_post',
    });

    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  /**
   * Verify Apple ID token
   */
  async verifyAppleToken(idToken: string): Promise<SocialUserData> {
    try {
      // In production, properly verify the Apple ID token using Apple's public keys
      // For demo purposes, we'll decode the JWT payload
      const payload = this.decodeJwtPayload(idToken);

      return {
        email: payload.email || '',
        firstName: payload.name?.firstName || '',
        lastName: payload.name?.lastName || '',
        socialId: payload.sub,
      };
    } catch (error) {
      this.logger.error('Apple ID token verification error', { error: error.message });
      throw new Error('Failed to verify Apple ID token');
    }
  }

  /**
   * Get Facebook OAuth authorization URL
   */
  async getFacebookAuthUrl(): Promise<string> {
    const clientId = this.configService.get('FACEBOOK_CLIENT_ID', 'demo-facebook-client-id');
    const redirectUri = this.configService.get('FACEBOOK_CALLBACK_URL', 'http://localhost:8080/auth/facebook/callback');
    const scope = 'email,public_profile';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: 'code',
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange Facebook authorization code for user data
   */
  async exchangeFacebookCode(code: string): Promise<SocialUserData> {
    try {
      const clientId = this.configService.get('FACEBOOK_CLIENT_ID', 'demo-facebook-client-id');
      const clientSecret = this.configService.get('FACEBOOK_CLIENT_SECRET', 'demo-facebook-client-secret');
      const redirectUri = this.configService.get('FACEBOOK_CALLBACK_URL', 'http://localhost:8080/auth/facebook/callback');

      // Exchange code for access token
      const tokenParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      });

      const tokenResponse = await firstValueFrom(
        this.httpService.get(`https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams.toString()}`)
      );

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await firstValueFrom(
        this.httpService.get('https://graph.facebook.com/v18.0/me', {
          params: {
            fields: 'id,first_name,last_name,email,picture.width(200).height(200)',
            access_token: access_token,
          },
        })
      );

      const profile = profileResponse.data;

      return {
        email: profile.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        socialId: profile.id,
        picture: profile.picture?.data?.url,
      };
    } catch (error) {
      this.logger.error('Facebook OAuth error', { error: error.message });
      throw new Error('Failed to authenticate with Facebook');
    }
  }

  /**
   * Validate social login configuration
   */
  validateConfiguration(): {
    google: boolean;
    apple: boolean;
    facebook: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Check Google configuration
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const googleConfigured = googleClientId && googleClientSecret && 
      !googleClientId.includes('demo') && !googleClientSecret.includes('demo');

    if (!googleConfigured) {
      warnings.push('Google OAuth not properly configured - using demo values');
    }

    // Check Apple configuration
    const appleClientId = this.configService.get('APPLE_CLIENT_ID');
    const applePrivateKey = this.configService.get('APPLE_PRIVATE_KEY');
    const appleConfigured = appleClientId && applePrivateKey && 
      !appleClientId.includes('demo') && !applePrivateKey.includes('demo');

    if (!appleConfigured) {
      warnings.push('Apple Sign In not properly configured - using demo values');
    }

    // Check Facebook configuration
    const facebookClientId = this.configService.get('FACEBOOK_CLIENT_ID');
    const facebookClientSecret = this.configService.get('FACEBOOK_CLIENT_SECRET');
    const facebookConfigured = facebookClientId && facebookClientSecret && 
      !facebookClientId.includes('demo') && !facebookClientSecret.includes('demo');

    if (!facebookConfigured) {
      warnings.push('Facebook OAuth not properly configured - using demo values');
    }

    if (warnings.length > 0) {
      this.logger.warn('Social authentication configuration warnings', { warnings });
    }

    return {
      google: googleConfigured,
      apple: appleConfigured,
      facebook: facebookConfigured,
      warnings,
    };
  }

  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Failed to decode JWT payload');
    }
  }

  /**
   * Refresh social provider access token
   */
  async refreshGoogleToken(refreshToken: string): Promise<string> {
    try {
      const clientId = this.configService.get('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

      const response = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        })
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to refresh Google token', { error: error.message });
      throw new Error('Failed to refresh Google access token');
    }
  }

  /**
   * Revoke social provider access
   */
  async revokeGoogleAccess(accessToken: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`https://oauth2.googleapis.com/revoke?token=${accessToken}`)
      );
    } catch (error) {
      this.logger.error('Failed to revoke Google access', { error: error.message });
    }
  }

  async revokeFacebookAccess(accessToken: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`)
      );
    } catch (error) {
      this.logger.error('Failed to revoke Facebook access', { error: error.message });
    }
  }
}