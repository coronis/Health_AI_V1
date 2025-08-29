# Contributing to HealthCoachAI

Welcome to HealthCoachAI! We're excited to have you contribute to building a world-class AI-powered health and wellness platform. This guide will help you understand our development process, standards, and how to contribute effectively.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Pledge
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (≥ 20.0.0)
- **pnpm** (≥ 8.0.0) - Our preferred package manager
- **Docker Desktop** - For local development environment
- **Git** - Version control
- **Xcode** (macOS only) - For iOS development
- **Android Studio** - For Android development

### Repository Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/Health_AI_V1.git
   cd Health_AI_V1
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/coronis/Health_AI_V1.git
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

5. **Start the development environment**:
   ```bash
   # Start Docker services
   docker compose -f infra/docker/docker-compose.yml up -d
   
   # Start the backend
   pnpm --filter services/backend dev
   ```

### Environment Configuration

1. Copy environment templates:
   ```bash
   cp services/backend/.env.example services/backend/.env
   cp apps/mobile/ios/.env.example apps/mobile/ios/.env
   cp apps/mobile/android/.env.example apps/mobile/android/.env
   ```

2. Configure your local environment variables (see README.md for details)

## 🔄 Development Process

### Phase-Based Development

HealthCoachAI follows a structured 16-phase development approach. Each contribution should align with the current phase and follow our architectural guidelines:

1. **Phase 0**: Documentation and Planning
2. **Phase 1**: Program Setup & Governance
3. **Phase 2**: Core Backend Architecture & Data Modeling
4. **[...see APPLICATION_PHASES.md for complete list]**

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for ongoing development
- **feature/[issue-number]-[brief-description]**: Feature development
- **bugfix/[issue-number]-[brief-description]**: Bug fixes
- **hotfix/[issue-number]-[brief-description]**: Critical production fixes

### Workflow

1. **Create an issue** or pick an existing one
2. **Create a feature branch** from `develop`
3. **Make your changes** following our coding standards
4. **Write/update tests** to cover your changes
5. **Run the full test suite** and ensure all tests pass
6. **Update documentation** as needed
7. **Submit a pull request** with a clear description

## 💻 Code Standards

### General Principles

- **No placeholder code**: All code must be production-ready
- **Security first**: Follow security best practices
- **Performance matters**: Consider performance implications
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Mobile-first**: Optimize for mobile experience

### TypeScript/JavaScript

```typescript
// Use descriptive names
const calculateUserDailyCalories = (user: User, activity: ActivityLevel): number => {
  // Implementation
}

// Always use TypeScript types
interface UserProfile {
  id: string;
  name: string;
  age: number;
  // ... other properties
}

// Use async/await over promises
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user data', { userId, error });
    throw new Error('User data fetch failed');
  }
}
```

### Code Organization

- **Domain-driven design**: Organize code by business domain
- **Separation of concerns**: Keep business logic separate from presentation
- **Dependency injection**: Use DI for better testability
- **Error boundaries**: Implement proper error handling

### Naming Conventions

- **Files**: kebab-case (`user-profile.service.ts`)
- **Directories**: kebab-case (`user-management/`)
- **Variables/Functions**: camelCase (`calculateBMI`)
- **Classes**: PascalCase (`UserProfileService`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Interfaces**: PascalCase with 'I' prefix (`IUserService`)

## 🧪 Testing Requirements

### Test Coverage

- **Minimum 85% code coverage** for all new code
- **90% coverage required** for critical paths by Phase 15
- **100% coverage required** for security-related functions

### Testing Strategy

#### Unit Tests
```typescript
describe('CalorieCalculator', () => {
  it('should calculate daily calories correctly', () => {
    const user = createMockUser({ weight: 70, height: 175, age: 30 });
    const calories = calculateDailyCalories(user, ActivityLevel.MODERATE);
    expect(calories).toBe(2200);
  });
});
```

#### Integration Tests
```typescript
describe('User API Integration', () => {
  it('should create user profile successfully', async () => {
    const userData = createMockUserData();
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.id).toBeDefined();
  });
});
```

#### E2E Tests
- Use XCUITest for iOS
- Use Espresso for Android
- Focus on critical user journeys

### Performance Testing

- **API Response Times**: p95 < 2s
- **Mobile App Launch**: < 3s
- **Memory Usage**: Monitor and optimize
- **Battery Impact**: Minimize background processing

## 🔒 Security Guidelines

### Critical Security Rules

1. **Never commit secrets**: Use environment variables and secrets management
2. **Validate all inputs**: Sanitize and validate user inputs
3. **Encrypt sensitive data**: Use proper encryption for PII/PHI
4. **Implement proper authentication**: JWT with refresh token rotation
5. **Use HTTPS everywhere**: No unencrypted communications
6. **Follow OWASP guidelines**: Implement OWASP ASVS recommendations

### Security Checklist

- [ ] No hardcoded secrets or API keys
- [ ] Input validation and sanitization implemented
- [ ] Proper error handling (no sensitive data in error messages)
- [ ] Authentication and authorization checks
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Audit logging for sensitive operations

### Data Privacy

- **PII/PHI minimization**: Collect only necessary data
- **Data encryption**: Encrypt at rest and in transit
- **Right to deletion**: Implement data deletion workflows
- **Consent tracking**: Track and respect user consent
- **Regional compliance**: Respect data residency requirements

## 📚 Documentation Standards

### Code Documentation

```typescript
/**
 * Calculates the user's daily caloric needs based on their profile and activity level.
 * Uses the Mifflin-St Jeor equation for BMR calculation.
 * 
 * @param user - User profile containing weight, height, age, and gender
 * @param activityLevel - User's activity level (sedentary to very active)
 * @returns Daily caloric needs in calories
 * @throws {ValidationError} When user data is invalid
 * 
 * @example
 * ```typescript
 * const calories = calculateDailyCalories(user, ActivityLevel.MODERATE);
 * console.log(`Daily calories: ${calories}`);
 * ```
 */
const calculateDailyCalories = (user: User, activityLevel: ActivityLevel): number => {
  // Implementation
}
```

### API Documentation

- Use OpenAPI 3.0 specifications
- Include request/response examples
- Document error codes and messages
- Provide authentication requirements

### Architecture Documentation

- Update ARCHITECTURE.md for significant changes
- Document design decisions and rationale
- Include diagrams for complex flows
- Maintain API contracts and interfaces

## 🔄 Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run the complete test suite**:
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

3. **Check for security issues**:
   ```bash
   pnpm audit
   ```

### PR Requirements

- **Clear description**: Explain what changes were made and why
- **Issue reference**: Link to related issues
- **Test coverage**: Include tests for new functionality
- **Documentation**: Update relevant documentation
- **Screenshots**: Include for UI changes
- **Breaking changes**: Clearly mark and explain

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one approving review required
3. **Security review**: Required for security-related changes
4. **Architecture review**: Required for architectural changes

## 🐛 Issue Reporting

### Bug Reports

Use our bug report template and include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (platform, version, etc.)
- **Screenshots** or screen recordings
- **Error logs** or stack traces

### Feature Requests

Use our feature request template and include:

- **Problem statement**: What problem does this solve?
- **Proposed solution**: How should it work?
- **User story**: Who benefits and how?
- **Acceptance criteria**: What defines "done"?
- **Phase alignment**: Which development phase?

## 🏗️ Infrastructure & DevOps

### Local Development

- Use Docker for consistent environments
- Follow infrastructure as code principles
- Test locally before pushing

### CI/CD

- All tests must pass before merge
- Security scans required
- Performance regression tests
- Automated deployment to staging

## 🌍 Internationalization

- Support for English and Hindi
- Hinglish input tolerance
- Cultural considerations for health recommendations
- Locale-specific formatting

## 📊 Performance Monitoring

- Track key metrics (response times, error rates, user engagement)
- Monitor AI model costs and usage
- Optimize for mobile performance
- Regular performance reviews

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Code Review**: Tag reviewers in PRs
- **Documentation**: Check our comprehensive docs

## 🎉 Recognition

We appreciate all contributions! Contributors will be:

- Listed in our CONTRIBUTORS.md file
- Recognized in release notes for significant contributions
- Invited to contributor events and discussions

---

Thank you for contributing to HealthCoachAI! Together, we're building the future of AI-powered health and wellness. 💪🚀