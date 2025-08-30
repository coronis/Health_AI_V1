import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserConsent } from './entities/user-consent.entity';
import { UserIdentity } from './entities/user-identity.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserProfilesService } from './services/user-profiles.service';
import { UserConsentsService } from './services/user-consents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserConsent,
      UserIdentity,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserProfilesService,
    UserConsentsService,
  ],
  exports: [
    UsersService,
    UserProfilesService,
    UserConsentsService,
  ],
})
export class UsersModule {}