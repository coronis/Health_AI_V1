#!/bin/bash

# HealthCoachAI Development Environment Setup
# This script sets up the complete development environment

set -e

echo "🚀 Setting up HealthCoachAI development environment..."

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is required. Please install Docker from https://docker.com/"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        echo "❌ Git is required. Please install Git from https://git-scm.com/"
        exit 1
    fi
    
    echo "✅ All prerequisites met"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install package dependencies
    cd packages/design-tokens && npm install && cd ../..
    cd packages/food-mappings && npm install && cd ../..
    cd packages/schema && npm install && cd ../..
    
    # Install backend dependencies
    cd services/backend && npm install && cd ../..
    
    # Install workers dependencies
    cd workers && npm install && cd ..
    
    echo "✅ Dependencies installed"
}

# Setup environment files
setup_environment() {
    echo "🔧 Setting up environment files..."
    
    # Backend environment
    if [ ! -f "services/backend/.env" ]; then
        cp services/backend/.env.example services/backend/.env
        echo "📝 Created services/backend/.env from example"
    fi
    
    # Workers environment
    if [ ! -f "workers/.env" ]; then
        cp workers/.env.example workers/.env
        echo "📝 Created workers/.env from example"
    fi
    
    # n8n environment
    if [ ! -f "n8n/.env" ]; then
        cp n8n/.env.example n8n/.env
        echo "📝 Created n8n/.env from example"
    fi
    
    # Mobile environment files
    if [ ! -f "apps/mobile/ios/.env" ]; then
        cp apps/mobile/ios/.env.example apps/mobile/ios/.env
        echo "📝 Created apps/mobile/ios/.env from example"
    fi
    
    if [ ! -f "apps/mobile/android/.env" ]; then
        cp apps/mobile/android/.env.example apps/mobile/android/.env
        echo "📝 Created apps/mobile/android/.env from example"
    fi
    
    echo "✅ Environment files created"
}

# Setup database
setup_database() {
    echo "🗄️  Setting up database..."
    
    # Start database with Docker Compose
    if [ -f "infra/docker/docker-compose.yml" ]; then
        cd infra/docker
        docker-compose up -d postgres redis
        cd ../..
        
        # Wait for database to be ready
        echo "⏳ Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        cd services/backend
        npm run db:migrate
        npm run db:seed
        cd ../..
        
        echo "✅ Database setup complete"
    else
        echo "⚠️  Docker Compose file not found. Please set up database manually."
    fi
}

# Build design tokens
build_design_tokens() {
    echo "🎨 Building design tokens..."
    
    cd packages/design-tokens
    npm run build
    cd ../..
    
    echo "✅ Design tokens built"
}

# Setup Git hooks
setup_git_hooks() {
    echo "🎣 Setting up Git hooks..."
    
    # Install husky
    npm run prepare
    
    echo "✅ Git hooks setup complete"
}

# Validate setup
validate_setup() {
    echo "🔍 Validating setup..."
    
    # Run linting
    npm run lint
    
    # Run type checking
    npm run typecheck
    
    # Run tests
    npm run test
    
    echo "✅ Setup validation complete"
}

# Main setup process
main() {
    check_prerequisites
    install_dependencies
    setup_environment
    build_design_tokens
    setup_git_hooks
    setup_database
    validate_setup
    
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review environment files and update with your settings"
    echo "2. Start the development servers:"
    echo "   - Backend: cd services/backend && npm run start:dev"
    echo "   - Workers: cd workers && npm run start:dev"
    echo "   - n8n: cd n8n && docker-compose up"
    echo "3. Open your IDE and start coding!"
    echo ""
    echo "For more information, see docs/backend/setup.md"
}

# Run main function
main "$@"