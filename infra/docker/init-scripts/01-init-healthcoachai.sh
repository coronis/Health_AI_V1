#!/bin/bash
# PostgreSQL initialization script for HealthCoachAI

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable pgvector extension
    CREATE EXTENSION IF NOT EXISTS vector;
    
    -- Create n8n database for workflow automation
    CREATE DATABASE n8n OWNER healthcoachai;
    
    -- Create schemas for different services
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE SCHEMA IF NOT EXISTS users;
    CREATE SCHEMA IF NOT EXISTS nutrition;
    CREATE SCHEMA IF NOT EXISTS fitness;
    CREATE SCHEMA IF NOT EXISTS ai;
    CREATE SCHEMA IF NOT EXISTS reports;
    CREATE SCHEMA IF NOT EXISTS analytics;
    
    -- Grant permissions
    GRANT ALL PRIVILEGES ON SCHEMA auth TO healthcoachai;
    GRANT ALL PRIVILEGES ON SCHEMA users TO healthcoachai;
    GRANT ALL PRIVILEGES ON SCHEMA nutrition TO healthcoachai;
    GRANT ALL PRIVILEGES ON SCHEMA fitness TO healthcoachai;
    GRANT ALL PRIVILEGES ON SCHEMA ai TO healthcoachai;
    GRANT ALL PRIVILEGES ON SCHEMA reports TO healthcoachai;
    GRANT ALL PRIVILEGES ON SCHEMA analytics TO healthcoachai;
    
    -- Create sample extension functions for health calculations
    CREATE OR REPLACE FUNCTION calculate_bmi(height_cm INTEGER, weight_kg DECIMAL)
    RETURNS DECIMAL AS \$\$
    BEGIN
        RETURN weight_kg / POWER(height_cm / 100.0, 2);
    END;
    \$\$ LANGUAGE plpgsql;
    
    COMMENT ON FUNCTION calculate_bmi(INTEGER, DECIMAL) IS 'Calculate BMI from height in cm and weight in kg';
EOSQL

echo "✅ HealthCoachAI database initialized successfully"