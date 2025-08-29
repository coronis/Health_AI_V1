import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getProfile() {
    return {
      id: '1',
      email: 'demo@healthcoachai.com',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
    };
  }
}