// Sample main.ts file for HealthCoachAI Backend
// This is a minimal placeholder to test TypeScript compilation

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet());
  app.use(compression());
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // API documentation
  const config = new DocumentBuilder()
    .setTitle('HealthCoachAI API')
    .setDescription('The HealthCoachAI API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  
  console.log(`🚀 HealthCoachAI Backend running on port ${port}`);
}

// Placeholder AppModule
class AppModule {}

bootstrap();