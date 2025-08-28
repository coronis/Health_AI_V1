# API Credentials and Configuration

This file contains API credentials and configuration values needed for the HealthAICoach application. **Replace all demo values with actual credentials before deployment.**

## Environment Configuration Guide

### Development Environment
Copy the demo values below to your `.env` files for development. The application is designed to work with these demo values for local development and testing.

### Production Environment
**⚠️ CRITICAL: Replace ALL demo values with actual production credentials before deploying.**

---

## AI Service Providers

### OpenAI Configuration
```bash
# Demo API Key for Development (Replace with actual OpenAI API key)
OPENAI_API_KEY=demo_openai_key_sk-1234567890abcdef
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7
```

### Anthropic Configuration
```bash
# Demo API Key for Development (Replace with actual Anthropic API key)
ANTHROPIC_API_KEY=demo_anthropic_key_sk-ant-1234567890abcdef
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TEMPERATURE=0.7
```

---

## Database Configuration

### PostgreSQL
```bash
# Demo Database URL for Development (Replace with actual database)
DATABASE_URL=postgresql://demo_user:demo_password@localhost:5432/healthai_demo
DATABASE_TEST_URL=postgresql://demo_user:demo_password@localhost:5432/healthai_test
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
```

### Redis Cache
```bash
# Demo Redis URL for Development (Replace with actual Redis instance)
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600
REDIS_SESSION_TTL=86400
```

---

## Authentication Services

### JWT Configuration
```bash
# Demo JWT Secret (Replace with strong random secret)
JWT_SECRET=demo_jwt_secret_change_in_production_123456789
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
```

### Google OAuth
```bash
# Demo Google OAuth credentials (Replace with actual Google OAuth app)
GOOGLE_CLIENT_ID=demo_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=demo_google_client_secret_GOCSPX-abcdef123456
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### Apple Sign-In
```bash
# Demo Apple Sign-In credentials (Replace with actual Apple developer credentials)
APPLE_CLIENT_ID=com.yourcompany.healthai.demo
APPLE_TEAM_ID=DEMO123456
APPLE_KEY_ID=DEMOKEY123
# Apple Private Key (Replace with actual .p8 file path)
APPLE_PRIVATE_KEY_PATH=./certs/demo_apple_private_key.p8
```

---

## Cloud Services

### AWS Configuration (if using AWS)
```bash
# Demo AWS credentials (Replace with actual AWS credentials)
AWS_ACCESS_KEY_ID=DEMO_ACCESS_KEY_12345
AWS_SECRET_ACCESS_KEY=demo_secret_access_key_abcdef123456789
AWS_REGION=us-east-1
AWS_S3_BUCKET=healthai-demo-bucket
```

### Firebase Configuration
```bash
# Demo Firebase configuration (Replace with actual Firebase project)
FIREBASE_PROJECT_ID=healthai-demo-project
FIREBASE_PRIVATE_KEY_ID=demo_firebase_key_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-demo@healthai-demo-project.iam.gserviceaccount.com
# Firebase Private Key (Replace with actual service account key)
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nDEMO_FIREBASE_PRIVATE_KEY\n-----END PRIVATE KEY-----
```

---

## Mobile App Configuration

### Push Notifications
```bash
# Demo FCM Server Key (Replace with actual Firebase Cloud Messaging key)
FCM_SERVER_KEY=demo_fcm_server_key_AAAA1234567890abcdef
FCM_SENDER_ID=123456789012

# Demo APNs Configuration (Replace with actual Apple Push Notification service)
APNS_KEY_ID=DEMO_APNS_KEY
APNS_TEAM_ID=DEMO123456
APNS_BUNDLE_ID=com.yourcompany.healthai.demo
# APNs Auth Key (Replace with actual .p8 file path)
APNS_AUTH_KEY_PATH=./certs/demo_apns_auth_key.p8
```

### App Store Configuration
```bash
# Demo App Store Connect API (Replace with actual App Store Connect credentials)
APP_STORE_CONNECT_KEY_ID=DEMO_ASC_KEY
APP_STORE_CONNECT_ISSUER_ID=demo-issuer-id-12345678-1234-1234-1234-123456789012
# App Store Connect API Key (Replace with actual .p8 file path)
APP_STORE_CONNECT_PRIVATE_KEY_PATH=./certs/demo_asc_private_key.p8
```

### Google Play Configuration
```bash
# Demo Google Play Console API (Replace with actual service account)
GOOGLE_PLAY_SERVICE_ACCOUNT_PATH=./certs/demo_google_play_service_account.json
GOOGLE_PLAY_PACKAGE_NAME=com.yourcompany.healthai.demo
```

---

## Monitoring and Analytics

### Sentry Configuration
```bash
# Demo Sentry DSN (Replace with actual Sentry project)
SENTRY_DSN=https://demo1234567890abcdef@o123456.ingest.sentry.io/1234567
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=1.0.0-demo
```

### Analytics Configuration
```bash
# Demo Analytics Configuration (Replace with actual analytics service)
ANALYTICS_WRITE_KEY=demo_analytics_write_key_12345abcdef
ANALYTICS_ENDPOINT=https://api.analytics-service.com/v1/track
```

---

## Health Platform Integrations

### Apple HealthKit
```bash
# HealthKit doesn't require API keys - configured in Info.plist
# Demo bundle identifier (Replace with actual app bundle ID)
HEALTHKIT_BUNDLE_ID=com.yourcompany.healthai.demo
```

### Google Fit
```bash
# Demo Google Fit API credentials (Replace with actual Google Cloud project)
GOOGLE_FIT_CLIENT_ID=demo_google_fit_client_id.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=demo_google_fit_client_secret_GOCSPX-abcdef123456
```

---

## Development Tools

### Code Quality
```bash
# Demo SonarQube token (Replace with actual SonarQube instance)
SONAR_TOKEN=demo_sonar_token_sqp_1234567890abcdef
SONAR_HOST_URL=https://sonarcloud.io
SONAR_ORGANIZATION=demo-org
```

### Code Coverage
```bash
# Demo Codecov token (Replace with actual Codecov project)
CODECOV_TOKEN=demo_codecov_token_12345678-1234-1234-1234-123456789012
```

---

## Security Configuration

### Encryption Keys
```bash
# Demo encryption key for PII data (Replace with strong random key)
DATA_ENCRYPTION_KEY=demo_data_encryption_key_32_chars_long_12345678
# Demo encryption salt (Replace with random salt)
DATA_ENCRYPTION_SALT=demo_encryption_salt_16_chars
```

### Rate Limiting
```bash
# Rate limiting configuration
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=100
RATE_LIMIT_WINDOW_SIZE=60
```

---

## Instructions for Production Deployment

### 1. Security Best Practices
- Use environment variables for all sensitive values
- Store secrets in secure vaults (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate API keys regularly
- Use separate credentials for development, staging, and production

### 2. Required Actions Before Production
1. Replace ALL demo values with actual production credentials
2. Set up proper secret management system
3. Configure environment-specific values
4. Test all integrations with actual credentials
5. Verify all API keys have proper permissions and rate limits

### 3. Environment Variable Files
Create the following files in your deployment:
- `.env.development` - Development environment variables
- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables (keep secure!)

### 4. Dockerfile Environment
Ensure your Docker containers load environment variables securely:
```dockerfile
# Example: Load environment variables in Docker
ENV NODE_ENV=production
# Use build args for non-sensitive values
ARG APP_VERSION=1.0.0
# Load sensitive values from secure mount or secret manager
```

---

## Phase-Specific API Usage

### Phase 1: Backend Foundation
**Required APIs:**
- Database (PostgreSQL)
- Cache (Redis)
- JWT Secret
- AI Provider APIs (OpenAI, Anthropic)

### Phase 2: Mobile Foundation
**Required APIs:**
- Backend API endpoints
- Firebase configuration (for crash reporting)

### Phase 3: AI Integration
**Required APIs:**
- OpenAI API Key
- Anthropic API Key
- Streaming endpoints

### Phase 4: Platform Integrations
**Required APIs:**
- Google OAuth/Fit credentials
- Apple Sign-In credentials
- Push notification credentials
- Health platform permissions

### Phase 5: CI/CD and Store Readiness
**Required APIs:**
- App Store Connect API
- Google Play Console API
- Code quality service tokens

### Phase 6: Final Testing and Validation
**Required APIs:**
- Monitoring service credentials
- Analytics service credentials
- Security scanning tokens

---

**⚠️ IMPORTANT SECURITY REMINDERS:**
1. Never commit actual API keys to version control
2. Use different credentials for each environment
3. Implement proper secret rotation
4. Monitor API usage and set up alerts for unusual activity
5. Follow principle of least privilege for all service accounts