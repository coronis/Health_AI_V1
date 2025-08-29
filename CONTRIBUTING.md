# Contributing to HealthCoachAI

We welcome contributions to HealthCoachAI! This document provides guidelines for
contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Submission Process](#submission-process)
- [Phase-Based Development](#phase-based-development)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We
are committed to providing a welcoming and inclusive environment for all
contributors.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome people of all backgrounds and identities
- **Be constructive**: Provide helpful feedback and criticism
- **Be patient**: Remember that everyone is learning
- **Be professional**: Maintain professionalism in all interactions

## Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js**: Version 18.19.0 or higher (see `.nvmrc`)
- **pnpm**: Version 8.15.0 or higher
- **Git**: Latest version
- **Docker**: For running local services (optional but recommended)

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/Health_AI_V1.git
   cd Health_AI_V1
   ```

3. **Set up the development environment**:

   ```bash
   # Use the correct Node.js version
   nvm use

   # Install dependencies
   pnpm install

   # Run the bootstrap script
   ./scripts/bootstrap.sh
   ```

4. **Set up your development environment**:

   ```bash
   ./scripts/setup_dev_env.sh
   ```

5. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/coronis/Health_AI_V1.git
   ```

## Development Workflow

### Branch Strategy

We use a feature branch workflow:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **Feature branches**: `feature/description` or `fix/description`
- **Hotfix branches**: `hotfix/description`

### Creating a Feature Branch

```bash
# Ensure you're on the latest develop branch
git checkout develop
git pull upstream develop

# Create and switch to your feature branch
git checkout -b feature/your-feature-description

# Start working on your changes
```

### Keeping Your Branch Updated

```bash
# Regularly sync with upstream
git fetch upstream
git rebase upstream/develop
```

## Coding Standards

### General Guidelines

- **Follow TypeScript best practices**
- **Use meaningful variable and function names**
- **Write self-documenting code**
- **Add comments for complex logic**
- **Follow the established project structure**

### Code Formatting

We use Prettier and ESLint for code formatting and linting:

```bash
# Format code
pnpm run format

# Lint code
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix
```

### TypeScript Guidelines

- **Use strict TypeScript configuration**
- **Define explicit types for public APIs**
- **Avoid `any` type - use `unknown` instead**
- **Use type assertions sparingly and safely**
- **Prefer interfaces over type aliases for object shapes**

### File Organization

```
services/
├── backend/
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   ├── common/           # Shared utilities
│   │   └── main.ts          # Application entry point
│   ├── libs/                # Internal libraries
│   └── tests/               # Test files
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase`

## Testing Requirements

### Testing Standards

- **Unit tests**: ≥85% coverage for all modules
- **Integration tests**: For API endpoints and database interactions
- **E2E tests**: For critical user journeys
- **Security tests**: For authentication and authorization

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch

# Run specific test file
pnpm run test path/to/test.spec.ts
```

### Writing Tests

- **Use descriptive test names**
- **Follow AAA pattern** (Arrange, Act, Assert)
- **Test edge cases and error conditions**
- **Mock external dependencies**
- **Use TypeScript for test files**

Example test structure:

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const invalidData = { name: 'John', email: 'invalid-email' };

      // Act & Assert
      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Invalid email format'
      );
    });
  });
});
```

## Security Guidelines

### Security Best Practices

- **Never commit secrets or API keys**
- **Use environment variables for configuration**
- **Validate all user inputs**
- **Implement proper error handling**
- **Follow OWASP security guidelines**
- **Use secure dependencies**

### Security Checklist

Before submitting code, ensure:

- [ ] No hardcoded secrets or API keys
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive information
- [ ] Authentication/authorization properly implemented
- [ ] Dependencies are up to date and secure
- [ ] HTTPS used for all external communications

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. **Email**: security@healthcoachai.com
3. **Include**: Detailed description and steps to reproduce
4. **Response**: We'll respond within 24 hours

## Submission Process

### Before Submitting

1. **Ensure your code follows our standards**:

   ```bash
   pnpm run lint
   pnpm run format:check
   pnpm run typecheck
   ```

2. **Run all tests**:

   ```bash
   pnpm run test:coverage
   ```

3. **Build the project**:

   ```bash
   pnpm run build
   ```

4. **Update documentation** if needed

### Creating a Pull Request

1. **Push your branch** to your fork:

   ```bash
   git push origin feature/your-feature-description
   ```

2. **Create a Pull Request** on GitHub with:
   - **Clear title** describing the change
   - **Detailed description** of what and why
   - **Reference to related issues**
   - **Screenshots** for UI changes
   - **Testing notes** for reviewers

3. **Fill out the PR template** completely

### PR Review Process

- **Automated checks** must pass (CI/CD pipeline)
- **Code review** by at least one team member
- **Security review** for security-related changes
- **Design review** for UI/UX changes
- **Performance review** for performance-critical changes

### After Review

- **Address feedback** promptly
- **Update tests** if required
- **Update documentation** if needed
- **Rebase and force-push** if requested

## Phase-Based Development

HealthCoachAI follows a phase-based development approach. Each phase has
specific deliverables and acceptance criteria.

### Current Phases

1. **Phase 0**: Documentation and Planning ✅
2. **Phase 1**: Program Setup & Governance
3. **Phase 2**: Core Backend Architecture & Data Modeling
4. **Phase 3**: Nutrition & Calculation Engines
5. ... (see APPLICATION_PHASES.md for full list)

### Contributing to Phases

- **Review the phase documentation** in `APPLICATION_PHASES.md`
- **Check the phase requirements** in `IMPLEMENTATION_PLAN.md`
- **Follow universal tasks** defined in `UNIVERSAL_TASKS.md`
- **Ensure your contribution fits** the current phase scope

### Phase Completion Criteria

Each phase must meet:

- [ ] All deliverables completed
- [ ] Tests passing with required coverage
- [ ] Security requirements met
- [ ] Performance benchmarks achieved
- [ ] Documentation updated
- [ ] Code review completed

## Documentation

### Documentation Requirements

- **Update README** for user-facing changes
- **Update API documentation** for API changes
- **Add inline comments** for complex logic
- **Update architecture docs** for structural changes
- **Include examples** for new features

### Documentation Style

- **Use clear, concise language**
- **Include code examples**
- **Provide context and rationale**
- **Update table of contents**
- **Use proper markdown formatting**

## Communication

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Slack**: Internal team communication
- **Email**: For security issues

### Asking Questions

When asking questions:

1. **Search existing issues** first
2. **Provide context** and relevant information
3. **Include code examples** when relevant
4. **Be specific** about what you're trying to achieve
5. **Follow up** with additional information if requested

## Recognition

We value all contributions to HealthCoachAI. Contributors will be:

- **Listed in our contributors file**
- **Mentioned in release notes** for significant contributions
- **Invited to contributor events** (when applicable)
- **Considered for maintainer status** based on consistent, quality
  contributions

## Questions?

If you have questions about contributing, please:

1. Check our [FAQ](docs/FAQ.md)
2. Search existing GitHub issues and discussions
3. Create a new discussion on GitHub
4. Contact the maintainers

Thank you for contributing to HealthCoachAI! 🚀
