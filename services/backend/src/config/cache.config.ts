import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const getCacheConfig = (configService: ConfigService): CacheModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    store: redisStore,
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get('REDIS_PORT', 6379),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB', 0),
    keyPrefix: configService.get('REDIS_KEY_PREFIX', 'healthcoachai:'),
    ttl: configService.get('CACHE_TTL', 300), // 5 minutes default
    max: configService.get('CACHE_MAX_ITEMS', 1000),
    // Connection settings
    retry_delay: 100,
    connect_timeout: 10000,
    // TLS for production
    ...(isProduction && {
      tls: {
        rejectUnauthorized: false,
      },
    }),
  };
};
