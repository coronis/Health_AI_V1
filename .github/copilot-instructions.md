# HealthCoachAI Development Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering only if the information here is incomplete or found to be in error.**

HealthCoachAI is a production-grade, AI-powered health, diet, and fitness application built as a monorepo using Node.js 20+, pnpm, TypeScript, NestJS backend, React Native mobile apps (iOS/Android), and n8n workflow orchestration.

## Working Effectively

### Prerequisites and Setup
- **Node.js 20+** (verified: v20.19.4 works)
- **pnpm 8.15.0+** (install with: `npm install -g pnpm@8.15.0`)
- **Docker Desktop** (for n8n and local infrastructure)
- **PostgreSQL 15+, Redis 7+** (for backend services)
- **Xcode** (for iOS development - on macOS only)
- **Android Studio and JDK 17** (for Android development)

### Bootstrap and Install Dependencies
```bash
# Install pnpm globally
npm install -g pnpm@8.15.0

# Install all dependencies (takes ~34 seconds)
pnpm install --frozen-lockfile
```
**NEVER CANCEL**: Dependencies install in 34 seconds. Set timeout to 120+ seconds.

### Build the Application
```bash
# Build entire monorepo (takes ~12 seconds)
pnpm run build
```
**NEVER CANCEL**: Full build takes 12 seconds. Set timeout to 300+ seconds.

### Development Commands
```bash
# Start all development servers
pnpm run dev

# Build for production
pnpm run build

# Run linting (use lint:fix to auto-fix issues)
pnpm run lint:fix

# Check TypeScript types
pnpm run typecheck

# Format all code
pnpm run format

# Check code formatting
pnpm run format:check
```

### Command Timing and Timeout Guidelines
- **Dependencies install**: 34 seconds (set timeout: 120+ seconds)
- **Full build**: 12 seconds (set timeout: 300+ seconds)
- **Lint:fix**: 4 seconds (set timeout: 60+ seconds)
- **Format**: 6 seconds (set timeout: 60+ seconds)
- **TypeCheck**: 9 seconds (set timeout: 120+ seconds)
- **Tests**: 18 seconds (set timeout: 300+ seconds - has current issues)

**CRITICAL**: NEVER CANCEL any build or test command. Use the timeouts specified above.

## Project Structure

### Key Directories
```
├── apps/mobile/               # Mobile applications
│   ├── android/              # Android Kotlin/Jetpack Compose app
│   └── ios/                  # iOS Swift/SwiftUI app
├── services/backend/         # NestJS backend API
├── packages/design-system/   # Shared design tokens and components
├── n8n/                      # Workflow orchestration setup
├── tools/                    # Build and development tools
└── .github/workflows/        # CI/CD pipelines
```

### Validated Applications
- **Backend**: NestJS TypeScript API (builds successfully)
- **Design System**: TypeScript package (builds successfully)
- **Android**: Kotlin/Gradle project (configured, not tested)
- **iOS**: Swift/Xcode project (configured, not tested)
- **n8n**: Docker-based workflow orchestration (configured)

## Testing and Validation

### Run Tests
```bash
# Run all tests (currently has TypeScript issues in test files)
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch
```
**STATUS**: ✅ Test suite passes with all 117 tests passing. All TypeScript compilation errors resolved.

### Validation Scenarios
After making changes, ALWAYS run through these validation steps:

1. **Build Validation**:
   ```bash
   pnpm run build
   ```

2. **Code Quality Validation**:
   ```bash
   pnpm run lint:fix
   pnpm run format
   pnpm run typecheck
   ```

3. **Backend Service Validation**:
   ```bash
   cd services/backend
   pnpm run start:dev
   ```
   **STATUS**: ✅ Server compiles and starts successfully (fails only on missing env vars as expected).

## Mobile Development

### Android Development
```bash
cd apps/mobile/android

# Make gradlew executable
chmod +x gradlew

# Build debug APK (requires Android SDK)
./gradlew build

# Run lint tasks
./gradlew ktlintCheck

# Run unit tests
./gradlew testDebugUnitTest
```
**Requirements**: JDK 17, Android SDK API 34, Build Tools 34.0.0

### iOS Development
```bash
cd apps/mobile/ios

# Open in Xcode
open HealthCoachAI.xcodeproj

# Build from command line (requires Xcode)
xcodebuild -project HealthCoachAI.xcodeproj -scheme HealthCoachAI build
```
**Requirements**: macOS, Xcode 15+

## Workflow Orchestration (n8n)

### Start n8n Development Environment
```bash
cd n8n

# Start n8n with PostgreSQL and Redis
docker compose up -d

# Access n8n interface
# URL: http://localhost:5678
# Default credentials: admin / demo-password-123
```

### Environment Setup
Copy environment templates:
```bash
cp services/backend/.env.example services/backend/.env
cp apps/mobile/ios/.env.example apps/mobile/ios/.env
cp apps/mobile/android/.env.example apps/mobile/android/.env
cp n8n/.env.example n8n/.env
```

## Common Issues and Solutions

### Build Issues
1. **TypeScript Errors**: Run `pnpm run typecheck` to identify issues
2. **Import Errors**: Check import paths and missing dependencies
3. **Module Not Found**: Ensure all dependencies are installed with `pnpm install`

### Backend Server Issues
1. **Current Status**: ✅ Server compiles and starts successfully
2. **Environment**: Requires PostgreSQL and Redis to be running (or env file)
3. **Database**: Use provided env templates for local development

### Test Issues
1. **Current Status**: ✅ All 117 tests passing
2. **Solution**: Test assertion issues resolved in safety-validation service
3. **Coverage**: Full test suite runs successfully in ~14 seconds

### Mobile Platform Issues
1. **Android**: Requires Android SDK setup, may not build without proper SDK
2. **iOS**: Requires macOS and Xcode for actual building
3. **Development**: Focus on backend and design system development first

## CI/CD Integration

### GitHub Actions
- **Backend**: `.github/workflows/backend.yml` - lint, test, build, security scan
- **Android**: `.github/workflows/mobile-android.yml` - lint, test, build APK/bundle
- **iOS**: `.github/workflows/mobile-ios.yml` - lint, test, build archive
- **Security**: `.github/workflows/security.yml` - secret scanning and security checks

### Before Committing
Always run these commands to ensure CI passes:
```bash
pnpm run lint:fix
pnpm run format
pnpm run build
```

## Current Known Issues

### Critical Issues to Fix
✅ **All major issues resolved**

### Working Components
1. **Build System**: ✅ Full monorepo build works (10.6 seconds)
2. **Dependencies**: ✅ All packages install correctly (33.3 seconds)
3. **Linting/Formatting**: ✅ Code quality tools work properly
4. **Design System**: ✅ Builds successfully
5. **Backend Server**: ✅ Compiles and starts successfully
6. **TypeScript**: ✅ All compilation passes without errors
7. **Test Suite**: ✅ All 117 tests passing (14.6 seconds)
8. **Project Structure**: ✅ All applications configured and structured correctly

### Recommended Development Approach
1. ✅ Start with design system and shared packages
2. ✅ Backend development fully functional
3. ✅ Test-driven development fully supported
4. Mobile development requires platform-specific tooling setup

## Key Commands Summary

| Command | Purpose | Time | Timeout |
|---------|---------|------|---------|
| `pnpm install --frozen-lockfile` | Install dependencies | 33s | 120s |
| `pnpm run build` | Build all packages | 11s | 300s |
| `pnpm run lint:fix` | Auto-fix linting issues | 2s | 60s |
| `pnpm run format` | Format all code | 6s | 60s |
| `pnpm run typecheck` | Check TypeScript | 8s | 120s |
| `pnpm run test` | Run tests | 15s | 300s |

**REMEMBER**: NEVER CANCEL builds or long-running commands. Always use the specified timeouts.