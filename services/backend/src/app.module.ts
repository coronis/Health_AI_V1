import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { getDatabaseConfig } from './config/database.config';
import { getCacheConfig } from './config/cache.config';

// Domain modules
import { UsersModule } from './domains/users/users.module';
import { HealthDomainModule } from './domains/health/health.module';
import { NutritionModule } from './domains/nutrition/nutrition.module';

// External services
import { USDAApiClient } from './external/usda/usda-api.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Database configuration
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),

    // Cache configuration
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => getCacheConfig(configService),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('THROTTLE_TTL', 60000), // 1 minute
            limit: configService.get('THROTTLE_LIMIT', 100), // 100 requests per minute
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Health check module
    HealthModule,

    // Domain modules
    UsersModule,
    HealthDomainModule,
    NutritionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    USDAApiClient, // External API client
  ],
})
export class AppModule {}
