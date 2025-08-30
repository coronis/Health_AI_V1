import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';
import { SocialAuthService } from './services/social-auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

import { User } from '../domains/users/entities/user.entity';
import { UserProfile } from '../domains/users/entities/user-profile.entity';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../domains/users/users.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'demo-jwt-secret-replace-in-production'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
          issuer: configService.get('JWT_ISSUER', 'healthcoachai'),
          audience: configService.get('JWT_AUDIENCE', 'healthcoachai-client'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserProfile]),
    SecurityModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    TokenService,
    SocialAuthService,
    JwtStrategy,
    GoogleStrategy,
    AppleStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    OptionalJwtAuthGuard,
  ],
  exports: [
    AuthService,
    OtpService,
    TokenService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}