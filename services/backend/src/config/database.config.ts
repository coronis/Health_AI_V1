import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST', 'localhost'),
    port: configService.get('POSTGRES_PORT', 5432),
    username: configService.get('POSTGRES_USER', 'healthcoachai'),
    password: configService.get('POSTGRES_PASSWORD', 'localdev'),
    database: configService.get('POSTGRES_DB', 'healthcoachai'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: !isProduction, // Only for development
    logging: !isProduction,
    ssl: isProduction
      ? {
          rejectUnauthorized: false,
        }
      : false,
    // Connection pool settings for production
    extra: {
      max: configService.get('POSTGRES_MAX_CONNECTIONS', 20),
      min: configService.get('POSTGRES_MIN_CONNECTIONS', 2),
      acquire: 30000,
      idle: 10000,
    },
  };
};
