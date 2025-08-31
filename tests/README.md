# Cross-cutting Tests

This directory contains comprehensive test suites that span multiple components and services.

## Structure

- `unit/` - Unit tests for shared utilities and libraries
- `integration/` - Integration tests across services
- `e2e/` - End-to-end tests simulating user workflows
- `performance/` - Load testing and performance benchmarks
- `security/` - Security penetration tests and vulnerability scans

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:security

# Run tests with coverage
npm run test:coverage
```

## Test Configuration

Tests use Jest as the primary testing framework with additional tools:
- Playwright for E2E testing
- Artillery for performance testing
- OWASP ZAP for security testing