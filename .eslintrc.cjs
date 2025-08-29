module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./tsconfig.base.json', './services/*/tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [],
  rules: {
    // General code quality rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',

    // Formatting (handled by prettier, but keep basic ones)
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
  },
  settings: {},
  overrides: [
    // Test files
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    // Configuration files
    {
      files: ['*.config.js', '*.config.ts', '.eslintrc.js'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
    // Mobile specific overrides
    {
      files: ['apps/mobile/**/*.ts', 'apps/mobile/**/*.tsx'],
      rules: {
        // Mobile apps might have different patterns
        'no-console': 'off', // Allow console in mobile for debugging
      },
    },
    // Backend specific overrides
    {
      files: ['services/backend/**/*.ts'],
      rules: {
        // Backend specific rules can be added here
      },
    },
    // Scripts and tools
    {
      files: ['scripts/**/*.ts', 'scripts/**/*.js', 'tools/**/*.ts'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off', // Scripts need console output
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.generated.ts',
    '*.generated.js',
    '*.d.ts',
    'apps/mobile/ios/Pods/',
    'apps/mobile/android/.gradle/',
    'apps/mobile/android/app/build/',
    'infra/terraform/.terraform/',
    '.next/',
    '.nuxt/',
    'public/',
    'static/',
  ],
};
