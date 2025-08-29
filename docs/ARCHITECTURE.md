# HealthCoachAI Architecture Documentation

## Overview

HealthCoachAI is a comprehensive, production-ready mobile and web application
that provides AI-powered health, nutrition, and fitness coaching. The
application is built using a modern, scalable architecture designed to handle
millions of users while maintaining security, privacy, and performance
standards.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile Apps   │    │   Web Client    │    │   Admin Panel   │
│  (iOS/Android)  │    │   (Optional)    │    │   (Internal)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │    API Gateway      │
                    │   (Load Balancer)   │
                    └─────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Backend API   │    │   AI Router     │    │  n8n Workflows │
│  (NestJS/Node)  │    │  (Orchestrate)  │    │ (Automation)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │   Data & Storage    │
                    │     Layer          │
                    └─────────────────────┘
```

### Technology Stack

#### Frontend

- **iOS**: SwiftUI + Combine
- **Android**: Kotlin + Jetpack Compose
- **Web (Optional)**: React + TypeScript
- **Design System**: Shared design tokens

#### Backend

- **API Server**: Node.js + NestJS + TypeScript
- **Runtime**: Node.js 18.19.0+
- **Package Manager**: pnpm
- **Architecture**: Domain-driven design with modular structure

#### Data Layer

- **Primary Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Object Storage**: S3-compatible (AWS S3, Google Cloud Storage)
- **Vector Store**: pgvector (PostgreSQL extension)
- **Search**: Optional OpenSearch/Elasticsearch

#### AI & ML

- **AI Orchestration**: n8n workflows
- **AI Providers**: OpenAI, Anthropic, Google Vertex AI, OpenRouter, Together AI
- **OCR**: Google Document AI, AWS Textract, Azure Form Recognizer
- **ML Models**: Multi-provider with fallback strategies

#### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)
- **Infrastructure as Code**: Terraform
- **CI/CD**: GitHub Actions
- **Monitoring**: OpenTelemetry, Prometheus, Grafana

## Backend Architecture

### Domain-Driven Design

The backend follows domain-driven design principles with clear separation of
concerns:

```
services/backend/
├── src/
│   ├── app.module.ts              # Main application module
│   ├── main.ts                    # Application entry point
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication & authorization
│   │   ├── users/                 # User management
│   │   ├── profiles/              # User profiles
│   │   ├── nutrition/             # Nutrition engine
│   │   ├── recipes/               # Recipe management
│   │   ├── plans/                 # Meal and fitness plans
│   │   ├── logs/                  # User logging (meals, activities)
│   │   ├── analytics/             # Analytics and reporting
│   │   ├── ai-router/             # AI provider routing
│   │   ├── reports/               # Health report processing
│   │   ├── chat/                  # AI chat functionality
│   │   ├── integrations/          # Third-party integrations
│   │   └── notifications/         # Push notifications
│   ├── common/                    # Shared utilities
│   │   ├── guards/                # Authentication guards
│   │   ├── interceptors/          # Request/response interceptors
│   │   ├── decorators/            # Custom decorators
│   │   ├── filters/               # Exception filters
│   │   └── pipes/                 # Validation pipes
│   └── config/                    # Configuration management
├── libs/                          # Internal libraries
│   ├── common/                    # Common utilities
│   ├── security/                  # Security utilities
│   ├── observability/             # Logging, metrics, tracing
│   └── persistence/               # Database utilities
└── tests/                         # Test files
```

### Module Architecture

Each module follows a consistent structure:

```
modules/[module-name]/
├── dto/                           # Data Transfer Objects
├── entities/                      # Database entities
├── repositories/                  # Data access layer
├── services/                      # Business logic
├── controllers/                   # HTTP controllers
├── guards/                        # Module-specific guards
├── [module-name].module.ts        # Module definition
└── tests/                         # Module tests
```

### API Design

#### RESTful API Standards

- **Versioning**: URL versioning (e.g., `/api/v1/`)
- **Resource Naming**: Plural nouns (e.g., `/users`, `/recipes`)
- **HTTP Methods**: Standard CRUD operations
- **Status Codes**: Proper HTTP status codes
- **Pagination**: Cursor-based pagination for large datasets
- **Rate Limiting**: Per-user and per-endpoint limits

#### OpenAPI Documentation

- Comprehensive API documentation using OpenAPI 3.0
- Automatic schema generation from TypeScript types
- Interactive API explorer for development

### Data Architecture

#### Database Design

**Core Entities:**

- Users, Identities, Consents
- Profiles (basic, lifestyle, health flags)
- Preferences (dietary, cuisines, allergies)
- Goals and targets
- Health Reports and structured entities
- Recipes with nutrition data
- Meal and Fitness Plans
- Activity and measurement logs
- Analytics and insights

**Security Features:**

- Field-level encryption for sensitive data
- Audit logging for all data access
- Data classification metadata
- Automatic PII detection and protection

#### Caching Strategy

- **Application Cache**: Redis for session data, API responses
- **Database Cache**: Query result caching
- **CDN Cache**: Static assets and public data
- **AI Response Cache**: Expensive AI computations

### Security Architecture

#### Authentication & Authorization

- **Multi-factor Authentication**: Phone OTP + OAuth
- **JWT Tokens**: Short-lived access tokens with refresh rotation
- **Device Binding**: Enhanced security for mobile devices
- **Role-Based Access Control (RBAC)**: Granular permissions
- **Attribute-Based Access Control (ABAC)**: Context-aware access

#### Data Protection

- **Encryption at Rest**: AES-256 with KMS key management
- **Encryption in Transit**: TLS 1.3 everywhere
- **Field-Level Encryption**: Sensitive PII/PHI fields
- **Data Loss Prevention (DLP)**: PII detection and redaction
- **Zero Retention**: AI providers with no data retention

#### Security Monitoring

- **Intrusion Detection**: Real-time security monitoring
- **Anomaly Detection**: Unusual access patterns
- **Audit Logging**: Comprehensive audit trails
- **Vulnerability Scanning**: Regular security assessments

## AI Architecture

### AI Router System

The AI Router orchestrates multiple AI providers based on accuracy and cost
policies:

```
┌─────────────────┐
│   Client App    │
└─────────────────┘
         │
┌─────────────────┐
│   API Gateway   │
└─────────────────┘
         │
┌─────────────────┐
│   AI Router     │
│   - Level 1/2   │
│   - Quotas      │
│   - Fallbacks   │
└─────────────────┘
         │
    ┌────┼────┐
    │    │    │
┌───▼┐ ┌▼─┐ ┌▼────┐
│OAI │ │AI│ │Vert │
│   │ │  │ │ ex  │
└────┘ └──┘ └─────┘
```

#### AI Policy Levels

- **Level 1 (Health Reports)**: Highest accuracy, daily quotas
- **Level 2 (Diet/Fitness)**: Cost-optimized within 5% accuracy

#### Provider Selection Algorithm

1. Determine task importance level
2. Check provider quotas and availability
3. Select optimal provider based on accuracy/cost
4. Implement fallback chain for reliability

### n8n Orchestration

n8n workflows handle complex AI pipelines:

- **Daily Plan Generation**: Automated meal/fitness planning
- **Health Report Processing**: OCR → NER → Interpretation
- **Weekly Reviews**: Adaptive plan adjustments
- **Notification Scheduling**: Contextual reminders
- **Data Syncing**: External integrations

## Mobile Architecture

### iOS Architecture (SwiftUI)

- **MVVM Pattern**: Model-View-ViewModel architecture
- **Combine Framework**: Reactive programming
- **SwiftUI**: Declarative UI framework
- **Core Data**: Local data persistence
- **Keychain**: Secure credential storage

### Android Architecture (Jetpack Compose)

- **MVVM Pattern**: Model-View-ViewModel architecture
- **Kotlin Coroutines**: Asynchronous programming
- **Jetpack Compose**: Modern UI toolkit
- **Room Database**: Local data persistence
- **EncryptedSharedPreferences**: Secure storage

### Shared Components

- **Design System**: Shared design tokens and components
- **API Client**: Generated from OpenAPI specifications
- **Offline Support**: Local caching and sync strategies
- **Push Notifications**: Firebase Cloud Messaging

## Deployment Architecture

### Environment Strategy

- **Development**: Local development with Docker Compose
- **Staging**: Production-like environment for testing
- **Production**: Multi-region deployment with auto-scaling

### Infrastructure Components

- **Load Balancer**: Application Load Balancer with SSL termination
- **Auto Scaling**: Horizontal pod autoscaling based on metrics
- **Database**: Managed PostgreSQL with read replicas
- **Cache**: Managed Redis cluster
- **Storage**: S3-compatible object storage
- **CDN**: CloudFront for static asset delivery

### Monitoring & Observability

- **Metrics**: Prometheus + Grafana dashboards
- **Logging**: Structured logging with ELK stack
- **Tracing**: OpenTelemetry distributed tracing
- **APM**: Application Performance Monitoring
- **Alerting**: PagerDuty integration for incidents

## Security & Compliance

### Security Framework

- **OWASP ASVS Level 2**: Application security verification
- **Zero Trust**: Network security model
- **Defense in Depth**: Multiple security layers
- **Security by Design**: Security built into architecture

### Privacy & Compliance

- **GDPR**: EU data protection regulation
- **HIPAA**: US health data protection
- **CCPA**: California consumer privacy act
- **Data Residency**: Regional data storage requirements

### Audit & Compliance

- **SOC 2 Type II**: Security audit framework
- **ISO 27001**: Information security management
- **Regular Audits**: Quarterly security assessments
- **Penetration Testing**: Annual security testing

## Performance & Scalability

### Performance Targets

- **API Response**: 95th percentile < 2 seconds
- **Mobile App Launch**: < 3 seconds
- **Database Queries**: 95th percentile < 500ms
- **AI Responses**: 95th percentile < 10 seconds

### Scalability Design

- **Horizontal Scaling**: Stateless services
- **Database Scaling**: Read replicas and sharding
- **Cache Strategy**: Multi-layer caching
- **CDN**: Global content delivery
- **Load Balancing**: Geographic load distribution

### Capacity Planning

- **Target Scale**: 10 million users
- **Peak Load**: 100,000 concurrent users
- **Storage**: Petabyte-scale data storage
- **Bandwidth**: Global content delivery

## Development Workflow

### Development Process

1. **Feature Planning**: Phase-based development
2. **Design Review**: Architecture and security review
3. **Implementation**: Test-driven development
4. **Code Review**: Peer review process
5. **Testing**: Unit, integration, and E2E tests
6. **Deployment**: Automated CI/CD pipeline

### Quality Assurance

- **Code Coverage**: 85% minimum, 90% for critical paths
- **Performance Testing**: Load and stress testing
- **Security Testing**: SAST, DAST, and penetration testing
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-platform**: iOS, Android, and web testing

## Future Considerations

### Scalability Enhancements

- **Microservices**: Service decomposition for scale
- **Event Sourcing**: Event-driven architecture
- **CQRS**: Command Query Responsibility Segregation
- **Service Mesh**: Advanced service communication

### Technology Evolution

- **AI/ML Improvements**: Model fine-tuning and optimization
- **Real-time Features**: WebSocket and Server-Sent Events
- **Progressive Web App**: Enhanced web experience
- **AR/VR Integration**: Immersive health experiences

### Global Expansion

- **Multi-region Deployment**: Regional data centers
- **Localization**: Multi-language support
- **Regional Compliance**: Local regulation compliance
- **Cultural Adaptation**: Region-specific features

---

This architecture documentation serves as the foundation for all development
work on HealthCoachAI. It should be reviewed and updated regularly as the system
evolves and new requirements emerge.
