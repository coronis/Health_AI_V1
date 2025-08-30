import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try to authenticate, but don't fail if no token
      return await super.canActivate(context);
    } catch (error) {
      // If authentication fails, just continue without user
      const request = context.switchToHttp().getRequest();
      request.user = null;
      return true;
    }
  }
}