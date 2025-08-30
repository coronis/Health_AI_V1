import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'demo-jwt-secret-replace-in-production'),
      issuer: configService.get('JWT_ISSUER', 'healthcoachai'),
      audience: configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
    });
  }

  async validate(payload: any) {
    // Additional validation can be performed here
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      deviceFingerprint: payload.deviceFingerprint,
    };
  }
}