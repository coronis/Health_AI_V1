import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8080);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global filters and interceptors will be added in Phase 1

  // Swagger documentation (only in development)
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('HealthCoachAI API')
      .setDescription('The HealthCoachAI API for health, nutrition and fitness coaching')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addTag('authentication', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('profiles', 'User profiles')
      .addTag('nutrition', 'Nutrition calculations')
      .addTag('recipes', 'Recipe management')
      .addTag('plans', 'Meal and fitness plans')
      .addTag('logs', 'User activity logs')
      .addTag('analytics', 'Analytics and insights')
      .addTag('ai', 'AI-powered features')
      .addTag('health', 'Health reports and analysis')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  // Use logger instead of console for proper logging
  const logger = app.get(Logger);
  logger.log(`🚀 HealthCoachAI API is running on: http://localhost:${port}`, 'Bootstrap');

  if (nodeEnv === 'development') {
    logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`, 'Bootstrap');
  }
}

bootstrap().catch(error => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Error starting application:', error);
  process.exit(1);
});
