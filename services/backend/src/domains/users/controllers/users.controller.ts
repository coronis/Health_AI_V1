import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UsersService } from '../services/users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UsersListResponseDto,
  UserStatsDto,
} from '../dto/user.dto';
import { UserStatus } from '../entities/user.entity';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
@UseGuards(ThrottlerGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Creating user: ${createUserDto.email}`);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by user status',
    enum: UserStatus,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: UsersListResponseDto,
  })
  @ApiBearerAuth()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('status') status?: UserStatus,
  ): Promise<UsersListResponseDto> {
    // Limit the maximum page size
    const maxLimit = Math.min(limit, 100);
    
    this.logger.log(`Getting users: page=${page}, limit=${maxLimit}, status=${status}`);
    return this.usersService.findAll(page, maxLimit, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User statistics retrieved successfully',
    type: UserStatsDto,
  })
  @ApiBearerAuth()
  async getStats(): Promise<UserStatsDto> {
    this.logger.log('Getting user statistics');
    
    const [activeUsers, usersCreatedToday, { total: totalUsers }] = await Promise.all([
      this.usersService.getActiveUsersCount(),
      this.usersService.getUsersCreatedToday(),
      this.usersService.findAll(1, 1), // Get total count
    ]);

    return {
      activeUsers,
      usersCreatedToday,
      totalUsers,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    this.logger.log(`Getting user: ${id}`);
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${id}`);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiBearerAuth()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`Deleting user: ${id}`);
    await this.usersService.remove(id);
  }

  @Patch(':id/verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async verifyEmail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    this.logger.log(`Verifying email for user: ${id}`);
    return this.usersService.verifyEmail(id);
  }

  @Patch(':id/lock')
  @ApiOperation({ summary: 'Lock user account' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'until',
    description: 'Lock until timestamp (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User locked successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiBearerAuth()
  async lockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('until') until: string,
  ): Promise<UserResponseDto> {
    this.logger.log(`Locking user: ${id} until ${until}`);
    const lockUntil = new Date(until);
    return this.usersService.lockUser(id, lockUntil);
  }
}