# Data Directory

This directory contains seed data, mappings, schemas, and sample files for the HealthCoachAI application.

## Structure

- `seeds/` - Initial data for seeding the database
  - `recipes/` - Recipe seed data
  - `exercises/` - Exercise and fitness seed data  
  - `lookups/` - Reference data (food groups, units, etc.)
- `mappings/` - Data mapping files
  - `gi_tables.csv` - Glycemic Index reference tables
  - `cooking_yields.csv` - Cooking yield factors
  - `nutrient_retention.csv` - Nutrient retention during cooking
- `schemas/` - Schema definitions
  - `openapi.yml` - OpenAPI specification
  - `graphql/` - GraphQL schema files
- `samples/` - Sample and test data
  - `reports/` - De-identified sample reports
  - `fixtures/` - Test fixtures