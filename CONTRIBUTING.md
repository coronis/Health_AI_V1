# Contributing to HealthCoachAI

Thank you for your interest in contributing to HealthCoachAI! This document provides guidelines and
instructions for contributing to our codebase.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Workflow](#contributing-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Security Guidelines](#security-guidelines)
- [Performance Guidelines](#performance-guidelines)
- [Review Process](#review-process)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct. We are committed to
providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18.19.0 or higher (use `.nvmrc` for exact version)
- pnpm 8.15.0 or higher
- Git
- Docker (for local development)

### First Time Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/Health_AI_V1.git
   cd Health_AI_V1
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Set up pre-commit hooks:

   ```bash
   pnpm prepare
   ```

5. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Environment Configuration

1. Copy environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Configure required environment variables (see `.env.example` for details)

### Available Scripts

```bash
# Development
pnpm dev              # Start all services in development mode
pnpm dev:mobile       # Start mobile development
pnpm dev:backend      # Start backend services

# Building
pnpm build            # Build all packages
pnpm build:mobile     # Build mobile apps
pnpm build:backend    # Build backend services

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm lint             # Lint all code
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
pnpm typecheck        # Run TypeScript checks

# Utilities
pnpm clean            # Clean build artifacts
pnpm clean:cache      # Clear Turbo cache
```

## 🔄 Contributing Workflow

### 1. Choose an Issue

- Look for issues labeled `good first issue` for your first contribution
- Comment on the issue to let others know you're working on it
- Ask questions if anything is unclear

### 2. Create a Branch

Use the following naming convention:

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for refactoring
- `test/description` - for test improvements

### 3. Make Changes

- Follow our coding standards (see below)
- Write tests for your changes
- Update documentation as needed
- Ensure all tests pass

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
git commit -m "feat(auth): add OAuth2 integration"
git commit -m "fix(mobile): resolve navigation issue"
git commit -m "docs(api): update authentication endpoints"
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a pull request using our PR template.

## 🎯 Coding Standards

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer `type` over `interface` for new definitions
- Use type imports: `import type { User } from './types'`
- Avoid `any` - use `unknown` or proper types
- Use meaningful variable and function names

### Code Organization

- Follow the established folder structure
- Keep files focused and single-purpose
- Use barrel exports in `index.ts` files
- Group related functionality together

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Folders**: `kebab-case`
- **Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types**: `PascalCase`
- **Components**: `PascalCase`

### Code Style

- Use functional programming patterns where appropriate
- Prefer composition over inheritance
- Keep functions small and focused
- Use descriptive variable names
- Add comments for complex logic only

## 🧪 Testing Guidelines

### Test Structure

```
src/
├── component.ts
├── component.test.ts        # Unit tests
├── component.integration.ts # Integration tests
└── __tests__/
    └── component.e2e.ts     # E2E tests
```

### Testing Standards

- Write tests for all new functionality
- Maintain > 90% coverage for critical paths
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

### Test Types

1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test module interactions
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Test for performance regressions

## 📚 Documentation

### Code Documentation

- Use JSDoc for public APIs
- Document complex algorithms
- Include usage examples
- Keep documentation up-to-date

### API Documentation

- Use OpenAPI/Swagger for REST APIs
- Document all endpoints, parameters, and responses
- Include example requests and responses
- Update documentation with API changes

## 🔒 Security Guidelines

### Security Requirements

- Never commit secrets or API keys
- Use environment variables for configuration
- Follow OWASP security guidelines
- Implement proper input validation
- Use parameterized queries for database access

### Data Privacy

- Minimize data collection
- Implement data encryption at rest and in transit
- Follow GDPR and other privacy regulations
- Implement proper access controls

## ⚡ Performance Guidelines

### General Performance

- Optimize for mobile-first performance
- Keep bundle sizes minimal
- Use lazy loading where appropriate
- Implement proper caching strategies
- Monitor performance metrics

### Mobile Performance

- Target 60fps for animations
- Optimize image sizes and formats
- Minimize network requests
- Use efficient data structures
- Profile memory usage

## 👥 Review Process

### Before Requesting Review

- [ ] All tests pass
- [ ] Code is properly formatted
- [ ] Documentation is updated
- [ ] Security guidelines followed
- [ ] Performance impact assessed

### Review Criteria

Reviewers will check for:

- Code quality and maintainability
- Test coverage and quality
- Security considerations
- Performance impact
- Documentation completeness
- Adherence to coding standards

### Getting Your PR Merged

1. Address all review feedback
2. Ensure CI/CD checks pass
3. Get approval from required reviewers
4. Squash commits if requested
5. Merge when ready

## 🤔 Questions and Support

### Getting Help

- Check existing documentation first
- Search through existing issues
- Ask questions in discussions
- Reach out to maintainers

### Communication Channels

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and discussions
- GitHub PRs: Code review and collaboration

## 📜 License

By contributing to HealthCoachAI, you agree that your contributions will be licensed under the MIT
License.

---

Thank you for contributing to HealthCoachAI! Your efforts help us build a better health coaching
platform for everyone. 🙏
