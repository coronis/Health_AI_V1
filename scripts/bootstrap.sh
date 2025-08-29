#!/bin/bash
set -e

# HealthCoachAI Development Environment Bootstrap Script
# This script sets up the development environment for HealthCoachAI

echo "🚀 HealthCoachAI Development Environment Bootstrap"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

print_status "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18.19.0 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.19.0"

if ! npx semver-compare $NODE_VERSION $REQUIRED_VERSION &> /dev/null; then
    print_warning "Node.js version $NODE_VERSION detected. Version $REQUIRED_VERSION or higher is recommended."
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm 8.15.0 or higher."
    print_status "You can install pnpm with: npm install -g pnpm"
    exit 1
fi

PNPM_VERSION=$(pnpm --version)
REQUIRED_PNPM="8.15.0"

print_success "Node.js $NODE_VERSION and pnpm $PNPM_VERSION detected"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    print_success "Docker detected"
else
    print_warning "Docker not found. Some local services may not be available."
fi

# Install dependencies
print_status "Installing dependencies..."
pnpm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Setup git hooks (if husky is configured)
if [ -f ".husky/pre-commit" ]; then
    print_status "Setting up git hooks..."
    pnpm run prepare
    print_success "Git hooks configured"
fi

# Create environment files from examples
print_status "Setting up environment files..."

# Backend environment
if [ ! -f "services/backend/.env" ] && [ -f "services/backend/.env.example" ]; then
    cp "services/backend/.env.example" "services/backend/.env"
    print_success "Created services/backend/.env from example"
    print_warning "Please update the environment variables in services/backend/.env"
fi

# Root environment (if needed)
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp ".env.example" ".env"
    print_success "Created .env from example"
fi

# n8n environment
if [ ! -f "n8n/.env" ] && [ -f "n8n/.env.example" ]; then
    mkdir -p n8n
    cat > n8n/.env.example << EOF
N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_PORT=5678
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=changeme
EOF
    cp "n8n/.env.example" "n8n/.env"
    print_success "Created n8n/.env from example"
fi

# Build packages
print_status "Building packages..."
pnpm run build

if [ $? -eq 0 ]; then
    print_success "Packages built successfully"
else
    print_warning "Some packages failed to build. This is normal for the initial setup."
fi

# Run linting and formatting
print_status "Running code quality checks..."
pnpm run lint:fix
pnpm run format

# Check if Docker Compose is available for local services
if command -v docker-compose &> /dev/null || command -v docker compose &> /dev/null; then
    print_status "Docker Compose detected. You can start local services with:"
    echo "  docker-compose up -d"
else
    print_warning "Docker Compose not found. Local services setup skipped."
fi

# Display next steps
echo ""
echo "=========================================="
print_success "Bootstrap completed successfully! 🎉"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update environment variables in services/backend/.env"
echo "2. Start local services (PostgreSQL, Redis) if needed"
echo "3. Run database migrations: cd services/backend && pnpm run db:migrate"
echo "4. Start development server: pnpm run dev"
echo ""
echo "Useful commands:"
echo "  pnpm run dev          # Start all services in development mode"
echo "  pnpm run build        # Build all packages"
echo "  pnpm run test         # Run all tests"
echo "  pnpm run lint         # Run linting"
echo "  pnpm run format       # Format code"
echo ""
echo "Documentation:"
echo "  README.md                    # Project overview"
echo "  CONTRIBUTING.md              # Contributing guidelines"
echo "  docs/ARCHITECTURE.md         # System architecture"
echo "  APPLICATION_PHASES.md        # Development phases"
echo ""
echo "Happy coding! 🚀"