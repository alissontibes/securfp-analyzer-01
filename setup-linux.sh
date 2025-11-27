#!/bin/bash

# SecuRFP Analyzer - Linux Setup Script
# This script automates the installation and setup process on Linux

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js installation
check_nodejs() {
    print_info "Checking Node.js installation..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version is below 18. Please upgrade to Node.js 18 or higher."
            print_info "You can install the latest LTS version using nvm:"
            print_info "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
            print_info "  nvm install --lts"
            exit 1
        fi
    else
        print_error "Node.js is not installed."
        print_info "Please install Node.js 18 or higher first."
        print_info "See INSTALL_LINUX.md for installation instructions."
        exit 1
    fi
    
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the project directory?"
        exit 1
    fi
    
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    print_info "Setting up environment configuration..."
    
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping environment setup"
            return
        fi
    fi
    
    print_info "Please enter your Gemini API key."
    print_info "You can get one from: https://aistudio.google.com/apikey"
    read -p "Gemini API Key: " API_KEY
    
    if [ -z "$API_KEY" ]; then
        print_warning "No API key provided. You can set it later in .env.local"
        echo "GEMINI_API_KEY=" > .env.local
    else
        echo "GEMINI_API_KEY=$API_KEY" > .env.local
        print_success "API key saved to .env.local"
    fi
    
    # Ensure .env.local is not committed
    if [ -f ".gitignore" ]; then
        if ! grep -q ".env.local" .gitignore; then
            echo ".env.local" >> .gitignore
            print_success "Added .env.local to .gitignore"
        fi
    fi
}

# Check port availability
check_port() {
    PORT=3000
    print_info "Checking if port $PORT is available..."
    
    if command_exists lsof; then
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $PORT is already in use"
            print_info "You may need to stop the process using this port or change it in vite.config.ts"
        else
            print_success "Port $PORT is available"
        fi
    elif command_exists netstat; then
        if netstat -tuln | grep -q ":$PORT "; then
            print_warning "Port $PORT is already in use"
        else
            print_success "Port $PORT is available"
        fi
    else
        print_warning "Cannot check port availability (lsof/netstat not found)"
    fi
}

# Main setup function
main() {
    echo "=========================================="
    echo "  SecuRFP Analyzer - Linux Setup"
    echo "=========================================="
    echo
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_warning "Running as root is not recommended for security reasons"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Run checks and setup
    check_nodejs
    echo
    install_dependencies
    echo
    setup_env
    echo
    check_port
    echo
    
    print_success "Setup completed successfully!"
    echo
    print_info "To start the development server, run:"
    echo "  npm run dev"
    echo
    print_info "The application will be available at:"
    echo "  http://localhost:3000"
    echo
    print_info "For production build, run:"
    echo "  npm run build"
    echo "  npm run preview"
    echo
}

# Run main function
main

