#!/bin/bash

# HealthCoachAI Local Development Environment Setup Script
# This script sets up the complete local development environment

set -e

echo "🏗️ Setting up HealthCoachAI Local Development Environment"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop from https://docker.com/get-started"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Some local development features may not work."
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Installing..."
        npm install -g pnpm
    fi
    
    print_status "Prerequisites check completed"
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "../../services/backend/.env" ]; then
        print_info "Creating backend .env file from example..."
        cp ../../services/backend/.env.example ../../services/backend/.env
        print_status "Backend .env file created"
    fi
    
    # n8n environment
    if [ ! -f "../../n8n/.env" ]; then
        print_info "Creating n8n .env file from example..."
        cp ../../n8n/.env.example ../../n8n/.env
        print_status "n8n .env file created"
    fi
    
    print_status "Environment files setup completed"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    cd ../..
    
    # Install root dependencies
    print_info "Installing root dependencies..."
    pnpm install
    
    print_status "Dependencies installation completed"
    
    cd infra/scripts
}

# Start services
start_services() {
    print_info "Starting development services with Docker Compose..."
    
    cd ../docker
    
    # Pull latest images
    print_info "Pulling latest Docker images..."
    docker-compose -f docker-compose.dev.yml pull
    
    # Start services
    print_info "Starting services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_status "Services started successfully"
    
    cd ../scripts
}

# Wait for services to be ready
wait_for_services() {
    print_info "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_info "Waiting for PostgreSQL..."
    until docker exec healthcoachai-postgres pg_isready -U healthcoachai -d healthcoachai_dev; do
        sleep 2
    done
    print_status "PostgreSQL is ready"
    
    # Wait for Redis
    print_info "Waiting for Redis..."
    until docker exec healthcoachai-redis redis-cli ping; do
        sleep 2
    done
    print_status "Redis is ready"
    
    # Wait for MinIO
    print_info "Waiting for MinIO..."
    until curl -f http://localhost:9000/minio/health/live &>/dev/null; do
        sleep 2
    done
    print_status "MinIO is ready"
    
    print_status "All services are ready"
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    
    cd ../../services/backend
    
    # Run migrations
    pnpm run migration:run
    
    print_status "Database migrations completed"
    
    cd ../../infra/scripts
}

# Setup MinIO buckets
setup_minio() {
    print_info "Setting up MinIO buckets..."
    
    # Install MinIO client
    if ! command -v mc &> /dev/null; then
        print_info "Installing MinIO client..."
        curl https://dl.min.io/client/mc/release/linux-amd64/mc \
          --create-dirs \
          -o ~/.local/bin/mc
        chmod +x ~/.local/bin/mc
        export PATH=$PATH:~/.local/bin
    fi
    
    # Configure MinIO client
    mc config host add local http://localhost:9000 demo-access-key demo-secret-key
    
    # Create buckets
    mc mb local/healthcoachai-dev
    mc mb local/healthcoachai-uploads
    mc mb local/healthcoachai-reports
    
    # Set bucket policies for development
    mc anonymous set public local/healthcoachai-dev
    
    print_status "MinIO setup completed"
}

# Show service URLs
show_urls() {
    print_info "Development environment is ready! 🎉"
    echo ""
    echo "📍 Service URLs:"
    echo "   🌐 Web Application:     http://localhost:3000"
    echo "   🔧 Backend API:         http://localhost:8080"
    echo "   🔄 n8n Workflows:       http://localhost:5678"
    echo "   📦 MinIO Console:       http://localhost:9001"
    echo "   🗄️  PostgreSQL:          localhost:5432"
    echo "   ⚡ Redis:               localhost:6379"
    echo ""
    echo "🔐 Default Credentials:"
    echo "   n8n:       demo-admin / demo-password-123"
    echo "   MinIO:     demo-access-key / demo-secret-key"
    echo "   Database:  healthcoachai / demo-password"
    echo ""
    echo "📚 Useful Commands:"
    echo "   View logs:              docker-compose -f infra/docker/docker-compose.dev.yml logs -f"
    echo "   Stop services:          docker-compose -f infra/docker/docker-compose.dev.yml down"
    echo "   Restart services:       docker-compose -f infra/docker/docker-compose.dev.yml restart"
    echo "   Clean up:               docker-compose -f infra/docker/docker-compose.dev.yml down -v"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    setup_environment
    install_dependencies
    start_services
    wait_for_services
    # run_migrations  # Commented out as migrations need to be implemented
    setup_minio
    show_urls
}

# Handle script interruption
trap 'echo -e "\n${RED}Setup interrupted${NC}"; exit 1' INT

# Run main function
main

print_status "Local development environment setup completed! 🚀"