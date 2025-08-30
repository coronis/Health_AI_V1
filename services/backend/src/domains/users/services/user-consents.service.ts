import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserConsent } from '../entities/user-consent.entity';

@Injectable()
export class UserConsentsService {
  private readonly logger = new Logger(UserConsentsService.name);

  constructor(
    @InjectRepository(UserConsent)
    private userConsentsRepository: Repository<UserConsent>,
  ) {}

  // Placeholder implementation for now
  async findByUserId(userId: string): Promise<UserConsent[]> {
    return this.userConsentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}