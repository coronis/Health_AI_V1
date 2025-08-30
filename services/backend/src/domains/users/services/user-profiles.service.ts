import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';

@Injectable()
export class UserProfilesService {
  private readonly logger = new Logger(UserProfilesService.name);

  constructor(
    @InjectRepository(UserProfile)
    private userProfilesRepository: Repository<UserProfile>,
  ) {}

  // Placeholder implementation for now
  async findByUserId(userId: string): Promise<UserProfile[]> {
    return this.userProfilesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
