# HealthCoachAI Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

A comprehensive, production-ready backend API for the HealthCoachAI platform, built with NestJS and TypeScript. This service provides AI-powered health coaching, meal planning, fitness guidance, and health report analysis.

## 🚀 Features

### Core Services
- **User Management**: Authentication, profiles, preferences, and consent management
- **AI-Powered Meal Planning**: Personalized nutrition recommendations with multi-provider AI routing
- **Health Report Analysis**: OCR processing, AI interpretation, and red-flag detection
- **Fitness Planning**: Custom workout plans with safety validation
- **Analytics & Progress Tracking**: Comprehensive user journey analytics
- **Real-time Chat**: AI health coach with context-aware responses

### AI & Machine Learning
- **Multi-Provider AI Routing**: OpenAI, Anthropic, Vertex AI, OpenRouter, Together AI
- **Cost Optimization**: Intelligent model selection based on accuracy requirements
- **Vector Database**: pgvector integration for RAG and semantic search
- **DLP & Privacy**: Data loss prevention and PII redaction for AI calls

### Integrations
- **Health Data**: HealthKit, Google Fit, Fitbit synchronization
- **Weather & AQI**: Environmental data for activity recommendations
- **Push Notifications**: APNS and FCM for mobile notifications
- **External APIs**: USDA FoodData Central, nutrition databases

### Security & Compliance
- **Enterprise Security**: Field-level encryption, audit logging, OWASP ASVS aligned
- **Privacy First**: GDPR compliance, data minimization, consent management
- **Rate Limiting**: Advanced throttling and abuse protection
- **Monitoring**: OpenTelemetry, Prometheus metrics, Sentry error tracking

## 🏗️ Architecture

```
src/
├── main.ts                    # Application entry point
├── app.module.ts             # Root module
├── common/                   # Shared utilities and services
│   ├── auth/                 # Authentication & authorization
│   ├── database/            # Database configuration
│   ├── monitoring/          # Observability and metrics
│   ├── performance/         # Performance optimization
│   └── security/            # Security utilities
├── domains/                 # Business domain modules
│   ├── users/              # User management
│   ├── auth/               # Authentication services
│   ├── meal-planning/      # AI meal planning
│   ├── health-reports/     # Health report processing
│   ├── fitness-planning/   # Fitness plan generation
│   ├── nutrition/          # Nutrition calculations
│   ├── analytics/          # User analytics
│   ├── chat/              # AI chat interface
│   ├── ai-routing/        # AI provider routing
│   └── integrations/      # External integrations
├── external-apis/          # External service clients
└── config/                 # Configuration management
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- Redis 7+
- pnpm 8+

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Install dependencies
pnpm install

# Setup database
pnpm run migration:run

# Start development server
pnpm run start:dev
```

### Database Setup
```bash
# Run migrations
pnpm run migration:run

# Seed initial data
pnpm run seed:run

# Generate new migration
pnpm run migration:generate -- src/migrations/MigrationName
```

## 📊 API Documentation

### OpenAPI/Swagger
- **Development**: http://localhost:8080/docs
- **API Schema**: http://localhost:8080/docs-json

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /users/profile` - User profile management
- `POST /meal-plans/generate` - AI meal plan generation
- `POST /health-reports/upload` - Health report analysis
- `GET /analytics/dashboard` - User analytics
- `POST /chat/message` - AI chat interface

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e

# Run tests in watch mode
pnpm run test:watch
```

### Test Coverage
- **Unit Tests**: 154 tests across 14 suites
- **Integration Tests**: Comprehensive API endpoint testing
- **E2E Tests**: Complete user journey validation
- **Target Coverage**: ≥90% on critical paths

## 🔧 Development

### Code Quality
```bash
# Linting
pnpm run lint
pnpm run lint:fix

# Type checking
pnpm run typecheck

# Formatting
pnpm run format
```

### Database Management
```bash
# Create migration
pnpm run migration:create -- MigrationName

# Run migrations
pnpm run migration:run

# Revert migration
pnpm run migration:revert

# Drop schema
pnpm run schema:drop
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t healthcoachai-backend .

# Run container
docker run -p 8080:8080 healthcoachai-backend
```

### Production Environment
- Set all environment variables via secrets management
- Enable monitoring and logging
- Configure load balancer and auto-scaling
- Set up backup and disaster recovery

## 📈 Monitoring & Observability

### Metrics
- **Performance**: Response times, throughput, error rates
- **Business**: User engagement, AI usage, cost metrics
- **Infrastructure**: Database connections, memory, CPU

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Sensitive Data**: Automatic PII redaction

### Health Checks
- `GET /health` - Basic health check
- `GET /health/database` - Database connectivity
- `GET /health/cache` - Redis connectivity
- `GET /health/ai-providers` - AI service status

## 🔐 Security

### Best Practices
- **Secrets Management**: Environment variables only, no hardcoded keys
- **Input Validation**: Comprehensive DTO validation
- **Rate Limiting**: Per-endpoint throttling
- **CORS**: Configured for production domains
- **Helmet**: Security headers enabled

### Authentication
- **JWT Tokens**: Access and refresh token rotation
- **OAuth**: Google, Apple, Facebook integration
- **MFA**: OTP-based multi-factor authentication
- **Session Management**: Redis-based session storage

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for all new features
3. Use conventional commit messages
4. Update documentation for API changes
5. Ensure all CI checks pass

## 📚 Documentation

- [API Documentation](http://localhost:8080/docs)
- [Database Schema](./docs/database-schema.md)
- [AI Integration Guide](./docs/ai-integration.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Guidelines](./docs/security.md)

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

**HealthCoachAI Backend** - Empowering personalized health journeys through AI 🏥💚