#!/bin/bash

# HealthCoachAI Development Environment Setup Script
# This script sets up the development environment for Phase 0

set -e

echo "🚀 Setting up HealthCoachAI development environment..."

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.19.0 or higher."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check pnpm installation
echo "📋 Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

PNPM_VERSION=$(pnpm --version)
echo "✅ pnpm version: $PNPM_VERSION"

# Install dependencies
echo "📦 Installing project dependencies..."
pnpm install

# Set up Git hooks
echo "🪝 Setting up Git hooks..."
pnpm prepare

# Create local environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating local environment file..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual configuration values"
fi

# Initialize git submodules if any
echo "📂 Initializing git submodules..."
git submodule update --init --recursive || true

# Run initial build to verify setup
echo "🏗️  Running initial build..."
pnpm build || echo "⚠️  Build failed - this is expected in Phase 0"

# Run linting to verify code quality tools
echo "🔍 Running code quality checks..."
pnpm lint || echo "⚠️  Linting failed - this is expected in Phase 0"

# Display setup summary
echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Start development server: pnpm dev"
echo "3. Run tests: pnpm test"
echo "4. Check the documentation in docs/ folder"
echo ""
echo "🔗 Useful commands:"
echo "  pnpm dev        - Start development servers"
echo "  pnpm build      - Build all packages"
echo "  pnpm test       - Run tests"
echo "  pnpm lint       - Run linting"
echo "  pnpm format     - Format code"
echo "  pnpm clean      - Clean build artifacts"
echo ""
echo "Happy coding! 🎉"