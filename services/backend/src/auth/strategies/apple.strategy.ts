import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('APPLE_CLIENT_ID', 'demo-apple-client-id'),
      teamID: configService.get('APPLE_TEAM_ID', 'demo-apple-team-id'),
      keyID: configService.get('APPLE_KEY_ID', 'demo-apple-key-id'),
      privateKeyString: configService.get('APPLE_PRIVATE_KEY', 'demo-apple-private-key'),
      callbackURL: configService.get('APPLE_CALLBACK_URL', 'http://localhost:8080/auth/apple/callback'),
      scope: ['name', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: any,
  ): Promise<any> {
    const { name, email } = idToken;
    
    const user = {
      email: email,
      firstName: name?.firstName || '',
      lastName: name?.lastName || '',
      accessToken,
      refreshToken,
      socialId: idToken.sub,
    };
    
    done(null, user);
  }
}