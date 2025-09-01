import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Custom error handling with token info logging
    if (err || !user) {
      console.debug('JWT authentication failed:', info?.message || 'No user');
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}
