# 🚀 HealthCoachAI Developer Quick Start

Welcome to the HealthCoachAI development environment! This guide will get you up and running in minutes.

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

### For Mobile Development:
- **Xcode** (macOS only) - for iOS development
- **Android Studio** - for Android development

## Quick Setup

### 1. Clone and Install
```bash
git clone https://github.com/coronis/Health_AI_V1.git
cd Health_AI_V1
pnpm install
```

### 2. Start Development Environment
```bash
# Start all infrastructure services (PostgreSQL, Redis, etc.)
cd infra/docker
docker compose up -d

# Wait for services to be ready (about 30 seconds)
```

### 3. Configure Environment
```bash
# Copy environment templates
cp services/backend/.env.example services/backend/.env

# Edit the .env file with your local settings if needed
# The defaults work for local development
```

### 4. Build and Start
```bash
# Build all packages
pnpm build

# Start backend development server
pnpm --filter @healthcoachai/backend dev

# In another terminal, build design tokens
pnpm --filter @healthcoachai/design-tokens build
```

## 🛠️ Development Commands

### Workspace Commands
```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Lint all code
pnpm lint

# Format all code
pnpm format
```

### Backend Development
```bash
# Start development server with hot reload
pnpm --filter @healthcoachai/backend dev

# Run tests
pnpm --filter @healthcoachai/backend test

# Type check
pnpm --filter @healthcoachai/backend type-check

# Lint and fix
pnpm --filter @healthcoachai/backend lint
```

### Design Tokens
```bash
# Build tokens for all platforms
pnpm --filter @healthcoachai/design-tokens build

# Validate token structure
pnpm --filter @healthcoachai/design-tokens validate

# Build for specific platform
pnpm --filter @healthcoachai/design-tokens build:ios
pnpm --filter @healthcoachai/design-tokens build:android
pnpm --filter @healthcoachai/design-tokens build:web
```

## 🐳 Docker Services

The development environment includes these services:

| Service | URL | Description |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | Main database with pgvector |
| Redis | `localhost:6379` | Cache and queue |
| MinIO | `localhost:9000` | S3-compatible object storage |
| MinIO Console | `localhost:9001` | MinIO admin interface |
| n8n | `localhost:5678` | Workflow automation |
| Prometheus | `localhost:9090` | Metrics collection |
| Grafana | `localhost:3001` | Monitoring dashboards |
| Jaeger | `localhost:16686` | Distributed tracing |
| Kibana | `localhost:5601` | Log visualization |
| MailHog | `localhost:8025` | Email testing |

### Default Credentials
- **n8n**: admin/admin123
- **Grafana**: admin/admin123
- **MinIO**: minioadmin/minioadmin123

## 📁 Project Structure

```
Health_AI_V1/
├── .github/                 # GitHub workflows and templates
├── apps/mobile/             # Mobile applications
│   ├── ios/                 # iOS app (SwiftUI)
│   ├── android/             # Android app (Jetpack Compose)
│   └── shared/              # Shared mobile code
├── services/backend/        # Backend services (NestJS)
├── packages/                # Shared packages
│   └── design-tokens/       # Design system tokens
├── infra/                   # Infrastructure
│   ├── docker/              # Docker development environment
│   ├── terraform/           # Infrastructure as code
│   └── monitoring/          # Monitoring configurations
├── docs/                    # Documentation
└── scripts/                 # Utility scripts
```

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Tests
```bash
# Backend tests
pnpm --filter @healthcoachai/backend test

# Watch mode
pnpm --filter @healthcoachai/backend test:watch

# Coverage
pnpm --filter @healthcoachai/backend test:cov
```

## 🔒 Security

This project follows security-first practices:

- **No secrets in code** - Use environment variables
- **Comprehensive security scanning** - In CI/CD pipelines
- **Dependency vulnerability checks** - Automated
- **Container security scanning** - Built into workflows

## 📱 Mobile Development

### iOS Development
```bash
cd apps/mobile/ios
# Open in Xcode
open HealthCoachAI.xcodeproj
```

### Android Development
```bash
cd apps/mobile/android
# Open in Android Studio
studio .
```

## 🚀 Deployment

### Environment Promotion
- **develop** branch → staging environment
- **main** branch → production environment

### Manual Deployment
Deployments are handled automatically via GitHub Actions when pushing to main branches.

## 📋 Phase-Based Development

This project follows a 16-phase development approach:

- **Phase 0**: ✅ Documentation and Planning (COMPLETE)
- **Phase 1**: Program Setup & Governance
- **Phase 2**: Core Backend Architecture & Data Modeling
- **[...continues through Phase 15]**

See [APPLICATION_PHASES.md](./APPLICATION_PHASES.md) for complete details.

## 🆘 Troubleshooting

### Common Issues

#### Docker services won't start
```bash
# Reset Docker environment
docker compose down -v
docker compose up -d
```

#### pnpm install fails
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### TypeScript errors
```bash
# Rebuild TypeScript projects
pnpm --filter @healthcoachai/backend build
```

### Getting Help

- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Read [SECURITY_PRIVACY.md](./SECURITY_PRIVACY.md) for security practices
- Open an issue using our templates in `.github/ISSUE_TEMPLATE/`

## ✨ Tips for Productivity

1. **Use the workspace**: Run commands at the root level when possible
2. **Leverage Docker**: The Docker environment has everything you need
3. **Follow conventions**: Use conventional commits and follow our coding standards
4. **Test early**: Run tests frequently during development
5. **Check security**: Our workflows catch security issues early

Happy coding! 🎉