"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 8080);
    const nodeEnv = configService.get('NODE_ENV', 'development');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', 'http://localhost:3000').split(','),
        credentials: configService.get('CORS_CREDENTIALS', true),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
        prefix: 'api/v',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    if (nodeEnv === 'development') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('HealthCoachAI API')
            .setDescription('The HealthCoachAI API for health, nutrition and fitness coaching')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
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
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api-docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    app.enableShutdownHooks();
    await app.listen(port);
    console.log(`🚀 HealthCoachAI API is running on: http://localhost:${port}`);
    if (nodeEnv === 'development') {
        console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
    }
}
bootstrap().catch(error => {
    console.error('❌ Error starting application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map