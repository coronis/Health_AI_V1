#!/bin/bash
set -e

# HealthCoachAI Development Environment Setup Script
# This script sets up the local development environment

echo "🛠️  HealthCoachAI Development Environment Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    print_error "This script must be run from the root of the HealthCoachAI repository"
    exit 1
fi

# Create local development directories
print_status "Creating local development directories..."
mkdir -p tmp/{uploads,exports,cache}
mkdir -p logs/{app,access,error}
mkdir -p data/{postgresql,redis,minio}

# Setup local PostgreSQL (if Docker is available)
if command -v docker &> /dev/null; then
    print_status "Setting up local PostgreSQL with Docker..."
    
    # Create docker-compose.dev.yml for local services
    cat > docker-compose.dev.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: healthcoachai-postgres
    environment:
      POSTGRES_DB: healthcoachai
      POSTGRES_USER: healthcoach
      POSTGRES_PASSWORD: localdev123
      POSTGRES_INITDB_ARGS: "--auth-host=md5"
    ports:
      - "5432:5432"
    volumes:
      - ./data/postgresql:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U healthcoach -d healthcoachai"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-test:
    image: postgres:15-alpine
    container_name: healthcoachai-postgres-test
    environment:
      POSTGRES_DB: healthcoachai_test
      POSTGRES_USER: healthcoach
      POSTGRES_PASSWORD: localdev123
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: healthcoachai-redis
    ports:
      - "6379:6379"
    volumes:
      - ./data/redis:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis-test:
    image: redis:7-alpine
    container_name: healthcoachai-redis-test
    ports:
      - "6380:6379"
    command: redis-server --appendonly no

  minio:
    image: minio/minio:latest
    container_name: healthcoachai-minio
    environment:
      MINIO_ROOT_USER: localdev
      MINIO_ROOT_PASSWORD: localdev123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - ./data/minio:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  n8n:
    image: n8nio/n8n:latest
    container_name: healthcoachai-n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=localdev123
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - ./n8n:/home/node/.n8n
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
  minio_data:
  n8n_data:
EOF

    # Create database initialization script
    cat > scripts/init-db.sql << EOF
-- HealthCoachAI Database Initialization Script

-- Create additional databases if needed
CREATE DATABASE healthcoachai_analytics;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set up basic permissions
GRANT ALL PRIVILEGES ON DATABASE healthcoachai TO healthcoach;
GRANT ALL PRIVILEGES ON DATABASE healthcoachai_analytics TO healthcoach;
EOF

    print_success "Docker Compose configuration created"
    print_status "Starting local services..."
    
    docker-compose -f docker-compose.dev.yml up -d postgres redis minio
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        print_success "Local services are running"
        echo ""
        echo "Service URLs:"
        echo "  PostgreSQL: localhost:5432 (user: healthcoach, db: healthcoachai)"
        echo "  Redis: localhost:6379"
        echo "  MinIO: http://localhost:9001 (admin:localdev/localdev123)"
        echo "  n8n: http://localhost:5678 (admin:admin/localdev123)"
    else
        print_warning "Some services may not be running properly"
    fi
else
    print_warning "Docker not available. Skipping local services setup."
fi

# Setup IDE configurations
print_status "Setting up IDE configurations..."

# VS Code settings
mkdir -p .vscode
cat > .vscode/settings.json << EOF
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.env*": "dotenv"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true,
    "**/coverage": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/coverage": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "eslint.workingDirectories": [
    "services/backend",
    "packages/design-tokens",
    "tools"
  ]
}
EOF

cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-docker",
    "gitpod.gitpod-desktop"
  ]
}
EOF

# Create launch configurations for debugging
cat > .vscode/launch.json << EOF
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/services/backend/src/main.ts",
      "outFiles": ["\${workspaceFolder}/services/backend/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "cwd": "\${workspaceFolder}/services/backend",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--config", "jest.config.js"],
      "cwd": "\${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
EOF

print_success "VS Code configuration created"

# Setup development scripts
print_status "Creating development scripts..."

cat > scripts/dev-backend.sh << 'EOF'
#!/bin/bash
# Start backend development server
cd services/backend
pnpm run start:dev
EOF

cat > scripts/dev-mobile.sh << 'EOF'
#!/bin/bash
# Start mobile development
echo "Mobile development setup will be completed in Phase 6"
echo "Current focus: Backend API development"
EOF

cat > scripts/test-all.sh << 'EOF'
#!/bin/bash
# Run all tests
echo "Running all tests..."
pnpm run test:coverage

echo "Running backend tests..."
cd services/backend
pnpm run test:cov

echo "Running integration tests..."
pnpm run test:e2e
EOF

chmod +x scripts/*.sh

print_success "Development scripts created"

# Final setup instructions
echo ""
echo "=========================================="
print_success "Development environment setup complete! 🎉"
echo "=========================================="
echo ""
echo "Your development environment is ready with:"
echo "✅ Local PostgreSQL database (Docker)"
echo "✅ Local Redis cache (Docker)"
echo "✅ Local MinIO object storage (Docker)"
echo "✅ VS Code configuration"
echo "✅ Development scripts"
echo ""
echo "Next steps:"
echo "1. Install dependencies: pnpm install"
echo "2. Set up environment variables: cp services/backend/.env.example services/backend/.env"
echo "3. Run database migrations: cd services/backend && pnpm run db:migrate"
echo "4. Start development: pnpm run dev"
echo ""
echo "Useful commands:"
echo "  ./scripts/dev-backend.sh     # Start backend development server"
echo "  ./scripts/test-all.sh        # Run all tests"
echo "  docker-compose -f docker-compose.dev.yml up -d  # Start all services"
echo "  docker-compose -f docker-compose.dev.yml down   # Stop all services"
echo ""
print_success "Happy coding! 🚀"