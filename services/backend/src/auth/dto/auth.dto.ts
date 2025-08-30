import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class LoginEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password: string;
}

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber('IN')
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber('IN')
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(4)
  otp: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsString()
  sessionId: string;
}