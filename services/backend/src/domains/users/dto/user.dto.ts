import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { UserStatus, UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@healthcoachai.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+919876543210',
  })
  @IsOptional()
  @IsPhoneNumber('IN') // Default to Indian phone numbers
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Data residency region',
    example: 'IN',
    default: 'IN',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dataResidencyRegion?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User status',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Whether user is anonymized for GDPR',
  })
  @IsOptional()
  @IsBoolean()
  isAnonymized?: boolean;

  @ApiPropertyOptional({
    description: 'Data retention expiration date',
  })
  @IsOptional()
  @IsDateString()
  dataRetentionExpiresAt?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiPropertyOptional()
  emailVerifiedAt?: Date;

  @ApiPropertyOptional()
  phoneVerifiedAt?: Date;

  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  dataResidencyRegion: string;

  @ApiPropertyOptional()
  isAnonymized?: boolean;
}

export class UsersListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;
}

export class UserStatsDto {
  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  usersCreatedToday: number;

  @ApiProperty()
  totalUsers: number;
}
