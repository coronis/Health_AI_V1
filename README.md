# HealthCoachAI

> End-to-End, Production-Grade AI Health & Wellness Platform

## Overview

HealthCoachAI is a comprehensive health and wellness platform that leverages AI
to provide personalized nutrition and fitness recommendations. The platform
includes native mobile applications for iOS and Android, a robust backend API,
and AI-powered health analysis capabilities.

## Features

- **Personalized Health Assessment**: AI-powered analysis of health reports and
  biometric data
- **Nutrition Planning**: Custom meal plans based on dietary preferences, health
  conditions, and goals
- **Fitness Recommendations**: Tailored workout plans with progression tracking
- **Health Report Processing**: OCR and NLP processing of medical documents
- **Wearable Integration**: Sync with popular fitness trackers and health
  devices
- **Real-time Chat**: AI-powered health coaching conversations

## Architecture

This is a production-ready monorepo built with:

- **Backend**: Node.js with NestJS framework
- **Database**: PostgreSQL with Redis caching
- **Mobile**: Native iOS (SwiftUI) and Android (Jetpack Compose)
- **AI/ML**: Multi-provider AI routing with n8n orchestration
- **Infrastructure**: Production-ready with monitoring and observability

## Repository Structure

```
Health_AI_V1/
├── services/backend/          # NestJS API server
├── apps/mobile-ios/          # SwiftUI iOS application
├── apps/mobile-android/      # Jetpack Compose Android app
├── packages/shared/          # Shared utilities and types
├── n8n/                      # AI workflow orchestration
├── infra/                    # Infrastructure as code
└── docs/                     # Project documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8.15.0+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Clone the repository
git clone https://github.com/coronis/Health_AI_V1.git
cd Health_AI_V1

# Install dependencies
pnpm install

# Set up environment variables
cp services/backend/.env.example services/backend/.env.local
# Edit .env.local with your configuration

# Start development servers
pnpm run dev
```

### Development Scripts

- `pnpm run build` - Build all packages and services
- `pnpm run test` - Run all tests
- `pnpm run lint` - Lint all code
- `pnpm run format` - Format code with Prettier
- `pnpm run typecheck` - TypeScript type checking

## Security

This project implements comprehensive security measures:

- Secret scanning with Gitleaks
- Dependency vulnerability scanning
- Static analysis with Semgrep and CodeQL
- TLS encryption for all communications
- Rate limiting and DDoS protection
- Comprehensive audit logging

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Application Phases](./APPLICATION_PHASES.md)
- [Security & Privacy](./SECURITY_PRIVACY.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Phase Development

This project follows a structured 16-phase development approach:

- **Phase 0**: Documentation and Planning ✅
- **Phase 1**: Program Setup & Governance ✅
- **Phase 2**: Core Backend Architecture & Data Modeling ✅
- **Phases 3-15**: Progressive feature development

See [APPLICATION_PHASES.md](./APPLICATION_PHASES.md) for detailed phase
information.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) for development workflow
and coding standards.
