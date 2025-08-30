import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // This guard is typically used with Passport's local strategy
    // For now, we'll implement basic validation
    const { email, password, phoneNumber, otp } = request.body;

    // Validate that either email+password or phoneNumber+otp is provided
    if (!((email && password) || (phoneNumber && otp))) {
      throw new UnauthorizedException(
        'Either email and password, or phoneNumber and OTP must be provided'
      );
    }

    return true;
  }
}