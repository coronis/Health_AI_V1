# OpenAPI Client Generator

This tool generates TypeScript API clients from OpenAPI specifications.

## Usage

```bash
# Generate all configured clients
npm run codegen

# Or run directly
ts-node openapi-client-gen.ts
```

## Configuration

The generator is configured to create clients for:

- Main API client from `data/schemas/openapi.yml`
- Backend client from `services/backend/openapi/schema.json`

## Generated Clients

Generated clients include:
- TypeScript interfaces for all models
- Axios-based API client classes
- Full type safety for requests and responses
- Automatic serialization/deserialization

## Requirements

- Node.js 18+
- OpenAPI Generator CLI
- Valid OpenAPI 3.0 specifications