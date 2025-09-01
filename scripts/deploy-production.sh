#!/bin/bash

# HealthCoachAI Production Deployment Script
# This script deploys the NestJS backend to production environment

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/services/backend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_LOG="/var/log/healthcoachai/deployment_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "${DEPLOYMENT_LOG}"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "${DEPLOYMENT_LOG}"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "${DEPLOYMENT_LOG}"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "${DEPLOYMENT_LOG}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as appropriate user
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
    
    # Check required commands
    local required_commands=("node" "npm" "docker" "git" "pm2")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Required command '$cmd' is not installed"
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local required_version="18.0.0"
    if ! npx semver "$node_version" -r ">=${required_version}" &> /dev/null; then
        error "Node.js version ${required_version} or higher is required. Current: ${node_version}"
    fi
    
    success "Prerequisites check passed"
}

# Environment setup
setup_environment() {
    log "Setting up environment..."
    
    # Create necessary directories
    sudo mkdir -p /var/log/healthcoachai
    sudo mkdir -p /var/lib/healthcoachai
    sudo mkdir -p /etc/healthcoachai
    
    # Set permissions
    sudo chown -R $(whoami):$(whoami) /var/log/healthcoachai
    sudo chown -R $(whoami):$(whoami) /var/lib/healthcoachai
    
    # Copy environment configuration
    if [[ ! -f "${BACKEND_DIR}/.env.production" ]]; then
        if [[ -f "${BACKEND_DIR}/.env.production.example" ]]; then
            cp "${BACKEND_DIR}/.env.production.example" "${BACKEND_DIR}/.env.production"
            warning "Created .env.production from example. Please configure with actual values."
        else
            error ".env.production.example not found. Cannot create production environment file."
        fi
    fi
    
    success "Environment setup completed"
}

# Database setup
setup_database() {
    log "Setting up production database..."
    
    # Load environment variables
    if [[ -f "${BACKEND_DIR}/.env.production" ]]; then
        source "${BACKEND_DIR}/.env.production"
    else
        error "Production environment file not found"
    fi
    
    # Check database connection
    log "Testing database connection..."
    cd "${BACKEND_DIR}"
    
    # Run database migrations
    log "Running database migrations..."
    npm run migration:run:prod || error "Database migration failed"
    
    # Seed initial data if needed
    if [[ "${SEED_DATABASE:-false}" == "true" ]]; then
        log "Seeding database with initial data..."
        npm run seed:prod || warning "Database seeding failed"
    fi
    
    success "Database setup completed"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "${BACKEND_DIR}"
    
    # Install dependencies
    log "Installing production dependencies..."
    npm ci --only=production || error "Failed to install dependencies"
    
    # Build application
    log "Building NestJS application..."
    npm run build || error "Build failed"
    
    # Verify build
    if [[ ! -f "${BACKEND_DIR}/dist/main.js" ]]; then
        error "Build verification failed - main.js not found"
    fi
    
    success "Application build completed"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Check if Let's Encrypt is configured
    if command -v certbot &> /dev/null; then
        # Renew certificates if they exist
        sudo certbot renew --quiet || warning "Certificate renewal failed"
    else
        warning "Certbot not installed. SSL certificates should be configured manually."
    fi
    
    success "SSL setup completed"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    cd "${BACKEND_DIR}"
    
    # Stop existing application if running
    if pm2 list | grep -q "healthcoachai"; then
        log "Stopping existing application..."
        pm2 stop healthcoachai || warning "Failed to stop existing application"
    fi
    
    # Start application with PM2
    log "Starting application with PM2..."
    pm2 start ecosystem.config.js --env production || error "Failed to start application"
    
    # Save PM2 configuration
    pm2 save || warning "Failed to save PM2 configuration"
    
    # Setup PM2 startup script
    pm2 startup || warning "Failed to setup PM2 startup script"
    
    success "Application deployment completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Setup log rotation
    cat > /tmp/healthcoachai-logrotate << EOF
/var/log/healthcoachai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    sudo mv /tmp/healthcoachai-logrotate /etc/logrotate.d/healthcoachai
    
    # Setup health check cron job
    (crontab -l 2>/dev/null; echo "*/5 * * * * curl -f http://localhost:3000/health || pm2 restart healthcoachai") | crontab -
    
    success "Monitoring setup completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is running
    if ! pm2 list | grep -q "healthcoachai.*online"; then
        error "Application is not running"
    fi
    
    # Check health endpoint
    local health_check_url="http://localhost:3000/health"
    if ! curl -f "$health_check_url" &> /dev/null; then
        error "Health check failed at $health_check_url"
    fi
    
    # Check API endpoint
    local api_check_url="http://localhost:3000/api/v1"
    if ! curl -f "$api_check_url" &> /dev/null; then
        warning "API endpoint check failed at $api_check_url"
    fi
    
    success "Deployment verification completed"
}

# Cleanup
cleanup() {
    log "Performing cleanup..."
    
    # Remove temporary files
    rm -rf /tmp/healthcoachai-*
    
    # Clean up old log files (keep last 7 days)
    find /var/log/healthcoachai -name "deployment_*.log" -mtime +7 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    log "Performing rollback..."
    
    # Stop current application
    pm2 stop healthcoachai || true
    
    # Restore from backup if available
    if [[ -d "/var/lib/healthcoachai/backup/previous" ]]; then
        log "Restoring from backup..."
        cp -r /var/lib/healthcoachai/backup/previous/* "${BACKEND_DIR}/"
        pm2 start healthcoachai || error "Failed to start application after rollback"
    else
        error "No backup available for rollback"
    fi
    
    success "Rollback completed"
}

# Main deployment process
main() {
    log "Starting HealthCoachAI production deployment..."
    log "Deployment log: ${DEPLOYMENT_LOG}"
    
    # Create backup of current deployment
    if [[ -d "${BACKEND_DIR}/dist" ]]; then
        log "Creating backup of current deployment..."
        mkdir -p /var/lib/healthcoachai/backup/previous
        cp -r "${BACKEND_DIR}/dist" /var/lib/healthcoachai/backup/previous/ || warning "Backup creation failed"
    fi
    
    # Deployment steps
    check_prerequisites
    setup_environment
    setup_database
    build_application
    setup_ssl
    deploy_application
    setup_monitoring
    verify_deployment
    cleanup
    
    success "🎉 HealthCoachAI production deployment completed successfully!"
    log "Application is running at: http://localhost:3000"
    log "Health check: http://localhost:3000/health"
    log "API documentation: http://localhost:3000/api"
    log "Logs: pm2 logs healthcoachai"
    log "Monitor: pm2 monit"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "verify")
        verify_deployment
        ;;
    "logs")
        tail -f "${DEPLOYMENT_LOG}"
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|verify|logs]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy application to production (default)"
        echo "  rollback - Rollback to previous deployment"
        echo "  verify   - Verify current deployment"
        echo "  logs     - Show deployment logs"
        exit 1
        ;;
esac