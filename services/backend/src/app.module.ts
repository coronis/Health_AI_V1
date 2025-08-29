import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env', '.env.development', '.env.production'],
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute
          },
        ],
      }),
    }),

    // Caching
    CacheModule.registerAsync({
      useFactory: () => ({
        ttl: 300, // 5 minutes default TTL
        max: 1000, // Maximum number of items in cache
      }),
    }),

    // Feature modules will be added in Phase 1
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
