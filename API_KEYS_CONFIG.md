# HealthAICoach API Keys and Configuration

This file contains all API keys, credentials, and configuration settings needed for the HealthAICoach application. Replace demo values with actual credentials when setting up production or development environments.

## AI Provider Configuration

### OpenAI Configuration
```env
# OpenAI API Configuration
OPENAI_API_KEY=demo_openai_api_key_replace_with_actual
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT=30
```

### Anthropic Configuration
```env
# Anthropic Claude API Configuration
ANTHROPIC_API_KEY=demo_anthropic_api_key_replace_with_actual
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TEMPERATURE=0.7
ANTHROPIC_TIMEOUT=30
```

## Database Configuration

### PostgreSQL Configuration
```env
# Database Configuration
DATABASE_URL=postgresql://demo_user:demo_password@localhost:5432/healthai_demo
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=healthai_demo
DATABASE_USER=demo_user
DATABASE_PASSWORD=demo_password
DATABASE_SSL_MODE=require
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=0
```

### Redis Configuration
```env
# Redis Cache Configuration
REDIS_URL=redis://demo_user:demo_password@localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=demo_password
REDIS_DB=0
REDIS_MAX_CONNECTIONS=20
```

## Authentication Configuration

### JWT Configuration
```env
# JWT Token Configuration
JWT_SECRET=demo_jwt_secret_key_replace_with_strong_secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```

### OAuth Configuration
```env
# Google OAuth Configuration
OAUTH_GOOGLE_CLIENT_ID=demo_google_client_id_replace_with_actual
OAUTH_GOOGLE_CLIENT_SECRET=demo_google_client_secret_replace_with_actual
OAUTH_GOOGLE_REDIRECT_URI=https://demo.healthaicoach.com/auth/google/callback

# Apple OAuth Configuration
OAUTH_APPLE_CLIENT_ID=demo_apple_client_id_replace_with_actual
OAUTH_APPLE_TEAM_ID=demo_apple_team_id_replace_with_actual
OAUTH_APPLE_KEY_ID=demo_apple_key_id_replace_with_actual
OAUTH_APPLE_PRIVATE_KEY_PATH=./certs/demo_apple_private_key.p8
OAUTH_APPLE_REDIRECT_URI=https://demo.healthaicoach.com/auth/apple/callback
```

## Email Configuration

### SMTP Configuration
```env
# Email Service Configuration
SMTP_HOST=smtp.demo-provider.com
SMTP_PORT=587
SMTP_USERNAME=demo_smtp_user@demo.com
SMTP_PASSWORD=demo_smtp_password_replace_with_actual
SMTP_FROM_EMAIL=noreply@demo.healthaicoach.com
SMTP_FROM_NAME=HealthAI Coach Demo
SMTP_USE_TLS=true
```

## Monitoring and Analytics

### Sentry Configuration
```env
# Sentry Error Tracking
SENTRY_DSN=https://demo_sentry_dsn@sentry.io/demo_project_id
SENTRY_ENVIRONMENT=demo
SENTRY_RELEASE=demo-version
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Firebase Configuration
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=demo-healthai-coach
FIREBASE_PRIVATE_KEY_ID=demo_firebase_key_id
FIREBASE_PRIVATE_KEY=demo_firebase_private_key_replace_with_actual
FIREBASE_CLIENT_EMAIL=demo-service-account@demo-healthai-coach.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=demo_firebase_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Firebase Cloud Messaging
FCM_SERVER_KEY=demo_fcm_server_key_replace_with_actual
FCM_SENDER_ID=demo_fcm_sender_id
```

### Analytics Configuration
```env
# Privacy-Friendly Analytics
ANALYTICS_WRITE_KEY=demo_analytics_write_key_replace_with_actual
ANALYTICS_ENDPOINT=https://api.demo-analytics.com
ANALYTICS_ENABLED=true
```

## Third-Party Health APIs

### Nutrition Database APIs
```env
# USDA FoodData Central API
USDA_API_KEY=demo_usda_api_key_replace_with_actual
USDA_BASE_URL=https://api.nal.usda.gov/fdc/v1

# Spoonacular API (for recipes)
SPOONACULAR_API_KEY=demo_spoonacular_api_key_replace_with_actual
SPOONACULAR_BASE_URL=https://api.spoonacular.com/recipes

# Nutritionix API
NUTRITIONIX_APP_ID=demo_nutritionix_app_id_replace_with_actual
NUTRITIONIX_API_KEY=demo_nutritionix_api_key_replace_with_actual
NUTRITIONIX_BASE_URL=https://trackapi.nutritionix.com/v2
```

### Fitness APIs
```env
# Fitbit API
FITBIT_CLIENT_ID=demo_fitbit_client_id_replace_with_actual
FITBIT_CLIENT_SECRET=demo_fitbit_client_secret_replace_with_actual

# MyFitnessPal API
MFP_CLIENT_ID=demo_mfp_client_id_replace_with_actual
MFP_CLIENT_SECRET=demo_mfp_client_secret_replace_with_actual
```

## App Store Configuration

### iOS App Store Connect
```env
# iOS App Store Connect API
APPSTORE_CONNECT_KEY_ID=demo_appstore_key_id_replace_with_actual
APPSTORE_CONNECT_ISSUER_ID=demo_appstore_issuer_id_replace_with_actual
APPSTORE_CONNECT_PRIVATE_KEY_PATH=./certs/demo_AuthKey.p8

# iOS Certificate and Provisioning
IOS_TEAM_ID=demo_ios_team_id_replace_with_actual
IOS_BUNDLE_ID=com.demo.healthaicoach
IOS_SIGNING_IDENTITY=iPhone Distribution: Demo Company (TEAMID)
```

### Android Play Store
```env
# Google Play Console API
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=./certs/demo-play-console-service-account.json
GOOGLE_PLAY_PACKAGE_NAME=com.demo.healthaicoach
ANDROID_KEYSTORE_PATH=./certs/demo-release-key.keystore
ANDROID_KEYSTORE_PASSWORD=demo_keystore_password_replace_with_actual
ANDROID_KEY_ALIAS=demo-release-key
ANDROID_KEY_PASSWORD=demo_key_password_replace_with_actual
```

## Security Configuration

### Encryption Configuration
```env
# Data Encryption Configuration
ENCRYPTION_KEY=demo_encryption_key_replace_with_32_byte_key
ENCRYPTION_ALGORITHM=AES-256-GCM
PII_ENCRYPTION_ENABLED=true
```

### API Security
```env
# API Security Configuration
API_RATE_LIMIT_PER_MINUTE=100
API_RATE_LIMIT_PER_HOUR=1000
API_CORS_ORIGINS=https://demo.healthaicoach.com,https://app.healthaicoach.com
API_ALLOWED_HOSTS=demo.healthaicoach.com,app.healthaicoach.com
```

## Environment-Specific Configuration

### Development Environment
```env
# Development Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
API_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:3000
MOBILE_DEEP_LINK_SCHEME=healthaicoach-dev
```

### Staging Environment
```env
# Staging Environment
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=INFO
API_BASE_URL=https://api-staging.healthaicoach.com
FRONTEND_BASE_URL=https://staging.healthaicoach.com
MOBILE_DEEP_LINK_SCHEME=healthaicoach-staging
```

### Production Environment
```env
# Production Environment
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
API_BASE_URL=https://api.healthaicoach.com
FRONTEND_BASE_URL=https://app.healthaicoach.com
MOBILE_DEEP_LINK_SCHEME=healthaicoach
```

## Mobile App Configuration

### Flutter Environment Variables
```dart
// lib/core/config/environment_config.dart
class EnvironmentConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8000',
  );
  
  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );
  
  static const bool debugMode = bool.fromEnvironment(
    'DEBUG',
    defaultValue: true,
  );
  
  static const String mobileDeepLinkScheme = String.fromEnvironment(
    'MOBILE_DEEP_LINK_SCHEME',
    defaultValue: 'healthaicoach-dev',
  );
}
```

## Configuration Usage Instructions

### For Development Setup
1. Copy this file to `.env` in your backend directory
2. Replace all `demo_*` values with actual development credentials
3. Update Flutter environment variables in `android/app/build.gradle` and `ios/Flutter/Release.xcconfig`

### For Production Setup
1. Use environment variables or secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
2. Never commit actual credentials to version control
3. Use different API keys for development, staging, and production environments

### Security Best Practices
- Rotate API keys regularly
- Use least-privilege access for all service accounts
- Monitor API usage and set up alerts for unusual activity
- Encrypt all configuration files in production
- Use secure secret management services in cloud deployments

### Phase-Specific Usage
- **Phase 1 (Backend Foundation)**: Database, JWT, basic auth configs
- **Phase 2 (Mobile Foundation)**: Firebase, environment configs
- **Phase 3 (AI Integration)**: OpenAI, Anthropic API keys
- **Phase 4 (Platform Integrations)**: Health APIs, notification configs
- **Phase 5 (CI/CD)**: App store, signing certificates
- **Phase 6 (Final Testing)**: All monitoring and analytics configs

## Configuration Validation

Each phase implementation should include configuration validation to ensure all required environment variables are present and properly formatted before the application starts.

```python
# Example validation function for backend
def validate_environment_config():
    required_vars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var) or os.getenv(var).startswith('demo_'):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing or demo configuration: {missing_vars}")
```