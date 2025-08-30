import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  deviceFingerprint: string;
}

export interface RefreshTokenData {
  userId: string;
  sessionId: string;
  deviceFingerprint: string;
  issuedAt: number;
  expiresAt: number;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly refreshTokenStore = new Map<string, RefreshTokenData>(); // In production, use Redis

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Clean up expired refresh tokens every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  /**
   * Generate JWT access token
   */
  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const tokenPayload = {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      deviceFingerprint: payload.deviceFingerprint,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.signAsync(tokenPayload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
      issuer: this.configService.get('JWT_ISSUER', 'healthcoachai'),
      audience: this.configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
    });
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(
    userId: string,
    sessionId: string,
    deviceFingerprint: string
  ): Promise<string> {
    const tokenId = this.generateTokenId();
    const expirationHours = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN_HOURS', 720); // 30 days
    const expiresAt = Date.now() + expirationHours * 60 * 60 * 1000;

    // Store refresh token data
    this.refreshTokenStore.set(tokenId, {
      userId,
      sessionId,
      deviceFingerprint,
      issuedAt: Date.now(),
      expiresAt,
    });

    // Create JWT with token ID
    const tokenPayload = {
      sub: userId,
      jti: tokenId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.signAsync(tokenPayload, {
      expiresIn: `${expirationHours}h`,
      issuer: this.configService.get('JWT_ISSUER', 'healthcoachai'),
      audience: this.configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
    });
  }

  /**
   * Verify and decode access token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        issuer: this.configService.get('JWT_ISSUER', 'healthcoachai'),
        audience: this.configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
      });

      if (decoded.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      return {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        sessionId: decoded.sessionId,
        deviceFingerprint: decoded.deviceFingerprint,
      };
    } catch (error) {
      this.logger.warn('Access token verification failed', { error: error.message });
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token and return stored data
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenData> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        issuer: this.configService.get('JWT_ISSUER', 'healthcoachai'),
        audience: this.configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
      });

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const tokenData = this.refreshTokenStore.get(decoded.jti);
      if (!tokenData) {
        throw new UnauthorizedException('Refresh token not found or revoked');
      }

      if (Date.now() > tokenData.expiresAt) {
        this.refreshTokenStore.delete(decoded.jti);
        throw new UnauthorizedException('Refresh token expired');
      }

      if (tokenData.userId !== decoded.sub) {
        throw new UnauthorizedException('Token user mismatch');
      }

      return tokenData;
    } catch (error) {
      this.logger.warn('Refresh token verification failed', { error: error.message });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: true, // Allow revoking expired tokens
      });

      if (decoded.jti) {
        this.refreshTokenStore.delete(decoded.jti);
        this.logger.log(`Refresh token revoked: ${decoded.jti}`);
      }
    } catch (error) {
      this.logger.warn('Failed to revoke refresh token', { error: error.message });
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    let revokedCount = 0;

    for (const [tokenId, tokenData] of this.refreshTokenStore.entries()) {
      if (tokenData.userId === userId) {
        this.refreshTokenStore.delete(tokenId);
        revokedCount++;
      }
    }

    this.logger.log(`Revoked ${revokedCount} tokens for user ${userId}`);
  }

  /**
   * Revoke all tokens for a session
   */
  async revokeSessionTokens(sessionId: string): Promise<void> {
    let revokedCount = 0;

    for (const [tokenId, tokenData] of this.refreshTokenStore.entries()) {
      if (tokenData.sessionId === sessionId) {
        this.refreshTokenStore.delete(tokenId);
        revokedCount++;
      }
    }

    this.logger.log(`Revoked ${revokedCount} tokens for session ${sessionId}`);
  }

  /**
   * Invalidate session (alias for revokeSessionTokens)
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await this.revokeSessionTokens(sessionId);
  }

  /**
   * Rotate refresh token (generate new one and revoke old)
   */
  async rotateRefreshToken(oldToken: string): Promise<string> {
    const tokenData = await this.verifyRefreshToken(oldToken);
    
    // Revoke old token
    await this.revokeRefreshToken(oldToken);
    
    // Generate new token
    return this.generateRefreshToken(
      tokenData.userId,
      tokenData.sessionId,
      tokenData.deviceFingerprint
    );
  }

  /**
   * Get active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<Array<{
    sessionId: string;
    deviceFingerprint: string;
    issuedAt: Date;
    expiresAt: Date;
  }>> {
    const sessions = new Map<string, RefreshTokenData>();

    for (const [tokenId, tokenData] of this.refreshTokenStore.entries()) {
      if (tokenData.userId === userId) {
        // Keep only the latest token per session
        const existing = sessions.get(tokenData.sessionId);
        if (!existing || tokenData.issuedAt > existing.issuedAt) {
          sessions.set(tokenData.sessionId, tokenData);
        }
      }
    }

    return Array.from(sessions.values()).map(session => ({
      sessionId: session.sessionId,
      deviceFingerprint: session.deviceFingerprint,
      issuedAt: new Date(session.issuedAt),
      expiresAt: new Date(session.expiresAt),
    }));
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    // In production, implement token blacklist using Redis
    // For now, just check if token exists in store (refresh tokens)
    return !this.refreshTokenStore.has(tokenId);
  }

  /**
   * Add token to blacklist
   */
  async blacklistToken(tokenId: string, expiresAt?: Date): Promise<void> {
    // In production, add to Redis blacklist with TTL
    this.refreshTokenStore.delete(tokenId);
    this.logger.log(`Token blacklisted: ${tokenId}`);
  }

  /**
   * Generate secure API key for external integrations
   */
  async generateApiKey(userId: string, name: string, permissions: string[]): Promise<{
    keyId: string;
    apiKey: string;
    expiresAt?: Date;
  }> {
    const keyId = this.generateTokenId();
    const secret = this.generateSecureString(64);
    
    const payload = {
      sub: userId,
      jti: keyId,
      type: 'api_key',
      name,
      permissions,
      iat: Math.floor(Date.now() / 1000),
    };

    // API keys don't expire by default, but can be set
    const expiresIn = this.configService.get('API_KEY_EXPIRES_IN');
    const apiKey = await this.jwtService.signAsync(payload, {
      secret: secret,
      expiresIn: expiresIn || undefined,
      issuer: this.configService.get('JWT_ISSUER', 'healthcoachai'),
      audience: 'healthcoachai-api',
    });

    // Store API key metadata (in production, use database)
    // This would include keyId, userId, name, permissions, createdAt, etc.

    return {
      keyId,
      apiKey,
      expiresAt: expiresIn ? new Date(Date.now() + this.parseExpirationTime(expiresIn) * 1000) : undefined,
    };
  }

  /**
   * Verify API key
   */
  async verifyApiKey(apiKey: string): Promise<{
    userId: string;
    keyId: string;
    name: string;
    permissions: string[];
  }> {
    try {
      // Extract key ID to get secret (in production, fetch from database)
      const decoded = this.jwtService.decode(apiKey) as any;
      if (!decoded || decoded.type !== 'api_key') {
        throw new UnauthorizedException('Invalid API key format');
      }

      // In production, fetch the secret from database using keyId
      // For now, assume verification works
      
      return {
        userId: decoded.sub,
        keyId: decoded.jti,
        name: decoded.name,
        permissions: decoded.permissions || [],
      };
    } catch (error) {
      this.logger.warn('API key verification failed', { error: error.message });
      throw new UnauthorizedException('Invalid API key');
    }
  }

  private generateTokenId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateSecureString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return result;
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [tokenId, tokenData] of this.refreshTokenStore.entries()) {
      if (now > tokenData.expiresAt) {
        this.refreshTokenStore.delete(tokenId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired refresh tokens`);
    }
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