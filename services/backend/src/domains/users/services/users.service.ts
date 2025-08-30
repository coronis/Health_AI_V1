import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
      status: UserStatus.PENDING_VERIFICATION,
    });

    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`User created successfully with ID: ${savedUser.id}`);

    // Remove password hash from response
    delete savedUser.passwordHash;
    return savedUser;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: UserStatus,
  ): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const options: FindManyOptions<User> = {
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['profiles'],
    };

    if (status) {
      options.where = { status };
    }

    const [users, total] = await this.usersRepository.findAndCount(options);
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => {
        delete user.passwordHash;
        return user;
      }),
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profiles', 'consents', 'identities'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    delete user.passwordHash;
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'status', 'role', 'failedLoginAttempts', 'lockedUntil'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);

    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      const saltRounds = 12;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User updated successfully with ID: ${updatedUser.id}`);
    delete updatedUser.passwordHash;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Soft deleting user with ID: ${id}`);

    const user = await this.findOne(id);
    
    // Soft delete
    user.deletedAt = new Date();
    user.status = UserStatus.INACTIVE;
    
    await this.usersRepository.save(user);
    this.logger.log(`User soft deleted successfully with ID: ${id}`);
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.findOne(id);
    
    user.emailVerifiedAt = new Date();
    user.status = UserStatus.ACTIVE;
    
    const updatedUser = await this.usersRepository.save(user);
    delete updatedUser.passwordHash;
    return updatedUser;
  }

  async lockUser(id: string, lockUntil: Date): Promise<User> {
    const user = await this.findOne(id);
    
    user.lockedUntil = lockUntil;
    user.status = UserStatus.SUSPENDED;
    
    const updatedUser = await this.usersRepository.save(user);
    delete updatedUser.passwordHash;
    return updatedUser;
  }

  async incrementFailedLoginAttempts(email: string): Promise<void> {
    await this.usersRepository.increment(
      { email },
      'failedLoginAttempts',
      1,
    );
  }

  async resetFailedLoginAttempts(email: string): Promise<void> {
    await this.usersRepository.update(
      { email },
      { failedLoginAttempts: 0 },
    );
  }

  async updateLastLogin(id: string, ipAddress?: string): Promise<void> {
    await this.usersRepository.update(
      { id },
      {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    );
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async getActiveUsersCount(): Promise<number> {
    return this.usersRepository.count({
      where: { status: UserStatus.ACTIVE },
    });
  }

  async getUsersCreatedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.usersRepository.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        } as any,
      },
    });
  }
}