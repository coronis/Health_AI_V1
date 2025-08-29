import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(loginDto: { email: string; password: string }) {
    // Demo implementation - in real app, validate credentials
    return {
      accessToken: 'demo-jwt-token',
      user: {
        id: '1',
        email: loginDto.email,
        name: 'Demo User',
      },
    };
  }

  register(registerDto: { email: string; password: string; name: string }) {
    // Demo implementation - in real app, create user
    return {
      id: '1',
      email: registerDto.email,
      name: registerDto.name,
      message: 'User registered successfully',
    };
  }
}