# HealthCoachAI Architecture Documentation

This document provides a comprehensive overview of the HealthCoachAI system architecture, designed to deliver a production-ready, scalable, and secure AI-powered health and wellness platform.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Data Architecture](#data-architecture)
- [AI/ML Architecture](#aiml-architecture)
- [Security Architecture](#security-architecture)
- [Mobile Architecture](#mobile-architecture)
- [Backend Architecture](#backend-architecture)
- [Infrastructure Architecture](#infrastructure-architecture)
- [Integration Architecture](#integration-architecture)
- [Deployment Architecture](#deployment-architecture)

## 🎯 System Overview

HealthCoachAI is an end-to-end AI-powered health and wellness platform designed to provide personalized nutrition and fitness coaching. The system consists of native mobile applications (iOS and Android), a robust backend infrastructure, AI orchestration layer, and comprehensive data processing pipelines.

### Core Capabilities

- **Personalized Nutrition Planning**: AI-driven meal plans with GI/GL optimization
- **Fitness Coaching**: Adaptive workout programs with progress tracking
- **Health Report Analysis**: OCR-based report processing with AI interpretation
- **Domain-Scoped Chat**: RAG-powered conversational AI for health queries
- **Wearable Integration**: Seamless data sync from HealthKit, Google Fit, and Fitbit
- **Real-time Analytics**: Advanced health metrics and progress visualization

## 🏗️ Architecture Principles

### 1. Domain-Driven Design (DDD)
- **Bounded Contexts**: Clear domain boundaries
- **Ubiquitous Language**: Consistent terminology across teams
- **Aggregate Roots**: Well-defined business entities
- **Domain Services**: Business logic encapsulation

### 2. Microservices Architecture
- **Service Autonomy**: Independent deployment and scaling
- **Data Ownership**: Each service owns its data
- **API-First Design**: Contract-driven development
- **Fault Isolation**: Failure containment

### 3. Event-Driven Architecture
- **Asynchronous Communication**: Non-blocking interactions
- **Event Sourcing**: Audit trail and state reconstruction
- **CQRS**: Command Query Responsibility Segregation
- **Eventual Consistency**: Distributed data consistency

### 4. Security by Design
- **Zero Trust**: Never trust, always verify
- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimal access rights
- **Privacy by Design**: Built-in privacy protection

### 5. Cloud-Native Principles
- **12-Factor App**: Cloud-native application design
- **Infrastructure as Code**: Declarative infrastructure
- **Observability**: Comprehensive monitoring and logging
- **Resilience**: Circuit breakers and graceful degradation

## 💻 Technology Stack

### Frontend (Mobile)
```typescript
// iOS Stack
{
  language: "Swift 5.9+",
  framework: "SwiftUI + Combine",
  architecture: "MVVM + Coordinator",
  storage: "Core Data + Keychain",
  networking: "URLSession + Alamofire",
  testing: "XCTest + XCUITest"
}

// Android Stack
{
  language: "Kotlin 1.9+",
  framework: "Jetpack Compose",
  architecture: "MVVM + Navigation Component",
  storage: "Room + EncryptedSharedPreferences",
  networking: "Retrofit + OkHttp",
  testing: "JUnit + Espresso"
}
```

### Backend Services
```typescript
// Technology Stack
{
  runtime: "Node.js 20+",
  framework: "NestJS 10+",
  language: "TypeScript 5+",
  database: "PostgreSQL 15+",
  cache: "Redis 7+",
  search: "PostgreSQL + pgvector",
  storage: "S3/GCS",
  queue: "Bull (Redis-based)",
  validation: "Zod",
  orm: "Prisma/TypeORM"
}
```

### AI/ML Orchestration
```typescript
// AI Stack
{
  orchestrator: "n8n",
  providers: ["OpenAI", "Anthropic", "Google Vertex", "OpenRouter"],
  vector_db: "pgvector",
  embeddings: "OpenAI text-embedding-3-large",
  ocr: ["Google Document AI", "AWS Textract"],
  monitoring: "Langfuse"
}
```

### Infrastructure
```typescript
// Infrastructure Stack
{
  containerization: "Docker + Docker Compose",
  orchestration: "Kubernetes (optional)",
  iac: "Terraform",
  monitoring: "Prometheus + Grafana",
  logging: "ELK Stack",
  tracing: "Jaeger/OpenTelemetry",
  secrets: "HashiCorp Vault / Cloud Secrets Manager"
}
```

## 🏛️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        iOS[iOS App<br/>SwiftUI]
        Android[Android App<br/>Jetpack Compose]
    end
    
    subgraph "CDN/Edge Layer"
        CDN[CloudFlare CDN]
        WAF[Web Application Firewall]
    end
    
    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Rate Limiting, Auth]
    end
    
    subgraph "Application Layer"
        Auth[Auth Service]
        User[User Service]
        Nutrition[Nutrition Service]
        Fitness[Fitness Service]
        AI[AI Router Service]
        Report[Report Service]
        Chat[Chat Service]
    end
    
    subgraph "Orchestration Layer"
        N8N[n8n Workflows]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Primary Data)]
        Redis[(Redis<br/>Cache)]
        S3[(Object Storage<br/>Files/Media)]
        Vector[(pgvector<br/>Embeddings)]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        USDA[USDA FoodData]
        Weather[Weather API]
    end
    
    iOS --> CDN
    Android --> CDN
    CDN --> WAF
    WAF --> Gateway
    Gateway --> Auth
    Gateway --> User
    Gateway --> Nutrition
    Gateway --> Fitness
    Gateway --> AI
    Gateway --> Report
    Gateway --> Chat
    
    AI --> N8N
    N8N --> OpenAI
    N8N --> Anthropic
    
    Auth --> Postgres
    User --> Postgres
    Nutrition --> Postgres
    Fitness --> Postgres
    Report --> Postgres
    Chat --> Vector
    
    User --> Redis
    Nutrition --> Redis
    Chat --> Redis
    
    Report --> S3
    User --> S3
    
    N8N --> USDA
    N8N --> Weather
```

## 🗄️ Data Architecture

### Data Flow Architecture

```mermaid
graph LR
    subgraph "Data Sources"
        Mobile[Mobile Apps]
        Wearables[Wearables]
        Reports[Health Reports]
        External[External APIs]
    end
    
    subgraph "Ingestion Layer"
        API[REST/GraphQL APIs]
        ETL[ETL Pipelines]
        Webhooks[Webhooks]
    end
    
    subgraph "Processing Layer"
        Validation[Data Validation]
        Transform[Data Transformation]
        Enrichment[Data Enrichment]
        ML[ML Processing]
    end
    
    subgraph "Storage Layer"
        OLTP[(OLTP Database<br/>PostgreSQL)]
        Cache[(Cache<br/>Redis)]
        Files[(Object Storage<br/>S3/GCS)]
        Vector[(Vector DB<br/>pgvector)]
    end
    
    subgraph "Analytics Layer"
        Aggregation[Data Aggregation]
        Metrics[Metrics Calculation]
        Insights[AI Insights]
    end
    
    Mobile --> API
    Wearables --> Webhooks
    Reports --> ETL
    External --> ETL
    
    API --> Validation
    Webhooks --> Validation
    ETL --> Validation
    
    Validation --> Transform
    Transform --> Enrichment
    Enrichment --> ML
    
    ML --> OLTP
    Transform --> Cache
    Reports --> Files
    ML --> Vector
    
    OLTP --> Aggregation
    Vector --> Insights
    Aggregation --> Metrics
```

### Database Schema Design

```sql
-- Core User Management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_encrypted TEXT,
    name_encrypted TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles (PII/PHI encrypted)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    dob_encrypted TEXT,
    gender VARCHAR(20),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    activity_level VARCHAR(50),
    health_goals TEXT[],
    dietary_restrictions TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Health Reports
CREATE TABLE health_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    file_path TEXT NOT NULL,
    report_type VARCHAR(100),
    processed_data JSONB,
    ai_interpretation TEXT,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Nutrition Data
CREATE TABLE nutrition_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    food_item VARCHAR(255),
    quantity DECIMAL(8,2),
    unit VARCHAR(50),
    calories INTEGER,
    macros JSONB,
    micros JSONB,
    logged_at TIMESTAMP DEFAULT NOW()
);

-- Vector Embeddings for RAG
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(100),
    content_id UUID,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

## 🤖 AI/ML Architecture

### AI Routing Strategy

```typescript
interface AIRoutingPolicy {
  level1: {
    // Health reports and report-focused queries
    accuracy: 'highest';
    models: ['gpt-4-turbo', 'claude-3-opus', 'gemini-pro'];
    dailyQuota: {
      tier1: 100,  // 100% accuracy
      tier2: 200,  // 98% accuracy  
      tier3: 500   // 97% accuracy
    };
    fallback: 'level2';
    zeroRetention: true;
    dlp: true;
  };
  level2: {
    // Diet, fitness, recipes, general chat
    accuracy: 'cost_optimized';
    models: ['gpt-4o-mini', 'claude-3-haiku', 'llama-3.1-70b'];
    selection: 'cheapest_within_5_percent';
    zeroRetention: true;
    dlp: true;
  };
}
```

### n8n Workflow Architecture

```typescript
// Core n8n Workflows
const workflows = {
  aiRouter: {
    name: "AI Request Router",
    triggers: ["webhook"],
    nodes: [
      "classification",
      "quota_check", 
      "model_selection",
      "dlp_sanitization",
      "ai_call",
      "response_processing",
      "audit_logging"
    ]
  },
  
  healthReportPipeline: {
    name: "Health Report Processing",
    triggers: ["file_upload"],
    nodes: [
      "ocr_processing",
      "ner_extraction", 
      "data_validation",
      "ai_interpretation",
      "confidence_scoring",
      "storage"
    ]
  },
  
  dailyPlanRunner: {
    name: "Daily Plan Generation",
    triggers: ["schedule"],
    nodes: [
      "user_data_collection",
      "preference_analysis",
      "meal_plan_generation",
      "fitness_plan_adaptation",
      "notification_scheduling"
    ]
  },
  
  weeklyReview: {
    name: "Weekly Plan Adaptation",
    triggers: ["schedule"],
    nodes: [
      "progress_analysis",
      "goal_assessment",
      "plan_optimization",
      "recommendation_updates"
    ]
  }
};
```

### RAG (Retrieval-Augmented Generation) Architecture

```typescript
interface RAGArchitecture {
  vectorStore: {
    database: "pgvector";
    dimensions: 1536;
    similarity: "cosine";
    indexType: "ivfflat";
  };
  
  documentTypes: [
    "user_profiles",
    "health_reports", 
    "meal_plans",
    "fitness_plans",
    "knowledge_base",
    "conversation_history"
  ];
  
  retrievalStrategy: {
    hybridSearch: true;
    semanticWeight: 0.7;
    keywordWeight: 0.3;
    maxResults: 10;
    contextWindow: 8000;
  };
  
  generationStrategy: {
    temperatureControl: true;
    citationGeneration: true;
    factualityChecking: true;
    domainScopeEnforcement: true;
  };
}
```

## 🔒 Security Architecture

### Zero Trust Security Model

```mermaid
graph TB
    subgraph "External Zone"
        Internet[Internet]
        CDN[CDN/WAF]
    end
    
    subgraph "DMZ"
        LB[Load Balancer]
        Gateway[API Gateway]
    end
    
    subgraph "Application Zone"
        Auth[Auth Service]
        Services[Application Services]
    end
    
    subgraph "Data Zone"
        Database[(Encrypted Database)]
        Secrets[(Secret Management)]
    end
    
    Internet --> CDN
    CDN --> LB
    LB --> Gateway
    Gateway --> Auth
    Auth --> Services
    Services --> Database
    Services --> Secrets
    
    classDef external fill:#ff9999
    classDef dmz fill:#ffcc99
    classDef app fill:#99ccff
    classDef data fill:#99ff99
    
    class Internet,CDN external
    class LB,Gateway dmz
    class Auth,Services app
    class Database,Secrets data
```

### Security Layers

1. **Network Security**
   - WAF protection against OWASP Top 10
   - DDoS protection and rate limiting
   - VPC/VNET isolation
   - Network segmentation

2. **Application Security**
   - OAuth 2.0 + JWT authentication
   - RBAC/ABAC authorization
   - Input validation and sanitization
   - CSRF and XSS protection

3. **Data Security**
   - Field-level encryption for PII/PHI
   - TLS 1.3 for data in transit
   - Key rotation and management
   - Data classification and handling

4. **Infrastructure Security**
   - Container image scanning
   - Runtime security monitoring
   - Infrastructure as Code scanning
   - Compliance monitoring

## 📱 Mobile Architecture

### iOS Architecture (SwiftUI + MVVM)

```swift
// Architecture Pattern
struct ContentView: View {
    @StateObject private var coordinator = AppCoordinator()
    
    var body: some View {
        coordinator.start()
    }
}

// MVVM Implementation
class UserProfileViewModel: ObservableObject {
    @Published var userProfile: UserProfile?
    @Published var isLoading = false
    @Published var error: AppError?
    
    private let userService: UserServiceProtocol
    
    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }
    
    @MainActor
    func loadUserProfile() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            userProfile = try await userService.getCurrentUser()
        } catch {
            self.error = AppError.from(error)
        }
    }
}

// Service Layer
protocol UserServiceProtocol {
    func getCurrentUser() async throws -> UserProfile
}

class UserService: UserServiceProtocol {
    private let apiClient: APIClient
    private let keychain: KeychainService
    
    func getCurrentUser() async throws -> UserProfile {
        let token = try keychain.getAccessToken()
        return try await apiClient.getUser(token: token)
    }
}
```

### Android Architecture (Jetpack Compose + MVVM)

```kotlin
// Architecture Pattern
@HiltAndroidApp
class HealthCoachApplication : Application()

// MVVM Implementation
@HiltViewModel
class UserProfileViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UserProfileUiState())
    val uiState: StateFlow<UserProfileUiState> = _uiState.asStateFlow()
    
    fun loadUserProfile() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                val userProfile = userRepository.getCurrentUser()
                _uiState.value = _uiState.value.copy(
                    userProfile = userProfile,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message,
                    isLoading = false
                )
            }
        }
    }
}

// Repository Pattern
@Singleton
class UserRepository @Inject constructor(
    private val apiService: ApiService,
    private val userDao: UserDao,
    private val secureStorage: SecureStorage
) {
    suspend fun getCurrentUser(): UserProfile {
        val token = secureStorage.getAccessToken()
        return apiService.getUser("Bearer $token")
    }
}
```

## ⚙️ Backend Architecture

### NestJS Modular Architecture

```typescript
// Application Module Structure
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    NutritionModule,
    FitnessModule,
    AIModule,
    HealthReportsModule,
    ChatModule,
    IntegrationsModule,
    NotificationsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}

// Domain Module Example
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    CacheModule.register(),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    UserProfileService,
    {
      provide: 'ENCRYPTION_SERVICE',
      useClass: FieldEncryptionService,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

// Service Implementation
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('ENCRYPTION_SERVICE')
    private readonly encryptionService: EncryptionService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Encrypt sensitive fields
    const encryptedData = await this.encryptionService.encryptUserData(
      createUserDto
    );
    
    // Create user
    const user = await this.userRepository.create(encryptedData);
    
    // Cache user data
    await this.cacheManager.set(
      `user:${user.id}`,
      user,
      { ttl: 3600 }
    );
    
    return user;
  }
}
```

### API Design Standards

```typescript
// REST API Standards
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
export class UsersController {
  
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUsers(
    @Query() query: PaginationDto,
    @Req() request: AuthenticatedRequest
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const users = await this.usersService.findAll(query);
    return {
      data: users.data,
      meta: {
        page: query.page,
        limit: query.limit,
        total: users.total,
        totalPages: Math.ceil(users.total / query.limit)
      }
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }
}

// DTO Validation
export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}
```

## 🏗️ Infrastructure Architecture

### Container Architecture

```dockerfile
# Multi-stage Dockerfile for Backend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs . .
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Kubernetes Deployment

```yaml
# Backend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: healthcoachai-backend
  labels:
    app: healthcoachai-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: healthcoachai-backend
  template:
    metadata:
      labels:
        app: healthcoachai-backend
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
      containers:
      - name: backend
        image: healthcoachai/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Terraform Infrastructure

```hcl
# AWS Infrastructure
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "healthcoachai-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = var.environment
    Project     = "HealthCoachAI"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "healthcoachai-postgres"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = "healthcoachai"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"
  
  skip_final_snapshot = false
  deletion_protection = true
  
  tags = {
    Environment = var.environment
    Project     = "HealthCoachAI"
  }
}
```

## 🔌 Integration Architecture

### External Service Integration

```typescript
// Health Data Integration
interface HealthKitIntegration {
  requestPermissions(): Promise<boolean>;
  syncData(): Promise<HealthData>;
  handleDataUpdates(): void;
}

interface GoogleFitIntegration {
  authenticate(): Promise<boolean>;
  fetchActivityData(): Promise<ActivityData>;
  subscribeToUpdates(): void;
}

interface FitbitIntegration {
  oauth2Flow(): Promise<OAuthTokens>;
  syncWearableData(): Promise<WearableData>;
  handleWebhooks(): void;
}

// Weather Service Integration
interface WeatherService {
  getCurrentWeather(location: Location): Promise<WeatherData>;
  getAirQuality(location: Location): Promise<AirQualityData>;
  getExerciseRecommendations(weather: WeatherData): ExerciseRecommendation[];
}

// Food Database Integration
interface USDAFoodDataService {
  searchFoods(query: string): Promise<FoodSearchResult[]>;
  getFoodDetails(id: string): Promise<FoodNutritionData>;
  getNutrientData(foodId: string): Promise<NutrientProfile>;
}
```

### Webhook Architecture

```typescript
// Webhook Handler
@Controller('webhooks')
export class WebhookController {
  
  @Post('fitbit')
  @UseGuards(WebhookAuthGuard)
  async handleFitbitWebhook(
    @Body() payload: FitbitWebhookPayload,
    @Headers('x-fitbit-signature') signature: string
  ): Promise<void> {
    // Verify webhook signature
    const isValid = this.webhookService.verifySignature(payload, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    
    // Process webhook data
    await this.wearableService.processFitbitData(payload);
  }
  
  @Post('healthkit')
  @UseGuards(WebhookAuthGuard)
  async handleHealthKitData(
    @Body() payload: HealthKitDataPayload
  ): Promise<void> {
    await this.wearableService.processHealthKitData(payload);
  }
}
```

## 🚀 Deployment Architecture

### CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['services/backend/**']
  pull_request:
    branches: [main]
    paths: ['services/backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./services/backend
    
    - name: Run tests
      run: npm run test:cov
      working-directory: ./services/backend
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
    
    - name: Run security audit
      run: npm audit --audit-level high
      working-directory: ./services/backend
    
    - name: Run SAST scan
      uses: securecodewarrior/github-action-add-sarif@v1
      with:
        sarif-file: 'security-scan-results.sarif'

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: |
        docker build -t healthcoachai/backend:${{ github.sha }} .
        docker tag healthcoachai/backend:${{ github.sha }} healthcoachai/backend:latest
      working-directory: ./services/backend
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push healthcoachai/backend:${{ github.sha }}
        docker push healthcoachai/backend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Deploy to production
      run: |
        kubectl set image deployment/healthcoachai-backend \
          backend=healthcoachai/backend:${{ github.sha }}
        kubectl rollout status deployment/healthcoachai-backend
```

### Monitoring and Observability

```typescript
// OpenTelemetry Setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT,
  }),
  metricExporter: new PrometheusExporter({
    port: 9090,
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PgInstrumentation(),
    new RedisInstrumentation(),
  ],
});

sdk.start();

// Custom Metrics
const meter = otel.metrics.getMeter('healthcoachai-backend');

const httpRequestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

const aiRequestDuration = meter.createHistogram('ai_request_duration_seconds', {
  description: 'Duration of AI requests',
});

const userRegistrations = meter.createCounter('user_registrations_total', {
  description: 'Total number of user registrations',
});
```

This architecture documentation provides a comprehensive overview of the HealthCoachAI system design, ensuring scalability, security, and maintainability while delivering a world-class user experience.

---

**Document Version**: 1.0
**Last Updated**: [Current Date]
**Next Review**: [Date + 3 months]