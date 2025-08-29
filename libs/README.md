# Shared Libraries

This directory contains shared libraries and utilities used across the monorepo.

## Structure

- `common/` - Common utilities and helpers
- `types/` - Shared TypeScript type definitions
- `constants/` - Application-wide constants
- `utils/` - Utility functions

## Usage

Libraries in this directory can be imported using the `@shared/*` path alias
defined in the TypeScript configuration.

```typescript
import { ApiResponse } from '@shared/types';
import { formatDate } from '@shared/utils';
```

## Development

Each library should have its own package.json for dependency management and
build scripts.
