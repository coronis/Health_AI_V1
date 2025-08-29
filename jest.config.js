module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/services', '<rootDir>/packages', '<rootDir>/libs'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'services/**/*.ts',
    'packages/**/*.ts',
    'libs/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@design-tokens$': '<rootDir>/packages/design-tokens/src',
    '^@food-mappings$': '<rootDir>/packages/food-mappings/src',
    '^@common/(.*)$': '<rootDir>/services/backend/libs/common/src/$1',
    '^@security/(.*)$': '<rootDir>/services/backend/libs/security/src/$1',
    '^@observability/(.*)$': '<rootDir>/services/backend/libs/observability/src/$1',
  },
};
