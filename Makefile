# Housing Strategy Dashboard Makefile
# Provides easy commands for development, deployment, and maintenance

.PHONY: help install dev build start stop restart logs clean test lint format check-deps docker-build docker-push

# Default target
help: ## Show this help message
	@echo "Housing Strategy Dashboard - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Quick Start:"
	@echo "  make dev          # Start development environment"
	@echo "  make build        # Build production images"
	@echo "  make start        # Start production environment"
	@echo ""

# Development Commands
install: ## Install all dependencies (backend + frontend)
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Dependencies installed successfully!"

dev: ## Start development environment with hot reload
	@echo "Starting development environment..."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo ""
	docker-compose up --build

dev-backend: ## Start only backend in development mode
	@echo "Starting backend development server..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start only frontend in development mode
	@echo "Starting frontend development server..."
	cd frontend && npm start

# Production Commands
build: ## Build production Docker images
	@echo "Building production images..."
	docker-compose -f docker-compose.yml build
	@echo "Production images built successfully!"

start: ## Start production environment
	@echo "Starting production environment..."
	docker-compose up -d
	@echo "Application started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

start-prod: ## Start production environment with nginx
	@echo "Starting production environment with nginx..."
	docker-compose --profile production up -d
	@echo "Production application started!"
	@echo "Application: http://localhost"

stop: ## Stop all running containers
	@echo "Stopping all containers..."
	docker-compose down
	@echo "Containers stopped!"

restart: ## Restart all containers
	@echo "Restarting containers..."
	docker-compose restart
	@echo "Containers restarted!"

# Monitoring and Debugging
logs: ## Show logs from all containers
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

logs-nginx: ## Show nginx logs only
	docker-compose logs -f nginx

status: ## Show container status
	@echo "Container Status:"
	docker-compose ps

shell-backend: ## Open shell in backend container
	docker-compose exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend /bin/sh

# Testing and Quality
test: ## Run all tests
	@echo "Running backend tests..."
	cd backend && python -m pytest tests/ -v
	@echo "Running frontend tests..."
	cd frontend && npm test -- --coverage --watchAll=false

test-backend: ## Run backend tests only
	@echo "Running backend tests..."
	cd backend && python -m pytest tests/ -v

test-frontend: ## Run frontend tests only
	@echo "Running frontend tests..."
	cd frontend && npm test -- --coverage --watchAll=false

lint: ## Run linting for both backend and frontend
	@echo "Linting backend..."
	cd backend && python -m flake8 app/ --max-line-length=100
	@echo "Linting frontend..."
	cd frontend && npm run lint

format: ## Format code for both backend and frontend
	@echo "Formatting backend..."
	cd backend && python -m black app/ --line-length=100
	@echo "Formatting frontend..."
	cd frontend && npm run format

# Database and Data Management
migrate: ## Run database migrations (if applicable)
	@echo "Running migrations..."
	# Add migration commands here when database is added

seed: ## Seed database with sample data (if applicable)
	@echo "Seeding database..."
	# Add seed commands here when database is added

# Cleanup Commands
clean: ## Clean up containers, images, and volumes
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "Cleanup completed!"

clean-all: ## Clean up everything including images
	@echo "Cleaning up all Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -af
	@echo "Complete cleanup finished!"

clean-frontend: ## Clean frontend build artifacts
	@echo "Cleaning frontend build artifacts..."
	cd frontend && rm -rf build/ node_modules/ .npm/
	@echo "Frontend cleanup completed!"

clean-backend: ## Clean backend build artifacts
	@echo "Cleaning backend build artifacts..."
	cd backend && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	cd backend && find . -name "*.pyc" -delete 2>/dev/null || true
	@echo "Backend cleanup completed!"

# Dependency Management
check-deps: ## Check for outdated dependencies
	@echo "Checking backend dependencies..."
	cd backend && pip list --outdated
	@echo "Checking frontend dependencies..."
	cd frontend && npm outdated

update-deps: ## Update all dependencies
	@echo "Updating backend dependencies..."
	cd backend && pip install --upgrade -r requirements.txt
	@echo "Updating frontend dependencies..."
	cd frontend && npm update
	@echo "Dependencies updated!"

# Docker Management
docker-build: ## Build Docker images without cache
	@echo "Building Docker images without cache..."
	docker-compose build --no-cache
	@echo "Docker images built!"

docker-push: ## Push Docker images to registry (configure registry first)
	@echo "Pushing Docker images to registry..."
	@echo "Note: Configure your registry in docker-compose.yml first"
	# docker-compose push

# Backup and Restore
backup: ## Create backup of application data
	@echo "Creating backup..."
	@mkdir -p backups
	docker-compose exec backend tar -czf /tmp/backup-$(shell date +%Y%m%d-%H%M%S).tar.gz /app/data/ 2>/dev/null || echo "No data directory to backup"
	@echo "Backup completed!"

# Health Checks
health: ## Check application health
	@echo "Checking application health..."
	@echo "Backend health:"
	@curl -s http://localhost:8000/health || echo "Backend not responding"
	@echo "Frontend health:"
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend responding" || echo "Frontend not responding"

# Environment Setup
setup: ## Initial setup for new developers
	@echo "Setting up development environment..."
	@echo "1. Installing dependencies..."
	$(MAKE) install
	@echo "2. Building Docker images..."
	$(MAKE) build
	@echo "3. Starting development environment..."
	$(MAKE) dev
	@echo "Setup completed! Visit http://localhost:3000"

# Documentation
docs: ## Generate and serve documentation
	@echo "Generating API documentation..."
	@echo "API docs available at: http://localhost:8000/docs"
	@echo "Starting documentation server..."
	cd docs && python -m http.server 8080 || echo "No docs directory found"

# Security
security-scan: ## Run security scans
	@echo "Running security scans..."
	@echo "Scanning backend dependencies..."
	cd backend && pip install safety && safety check
	@echo "Scanning frontend dependencies..."
	cd frontend && npm audit

# Performance
perf-test: ## Run performance tests
	@echo "Running performance tests..."
	@echo "Backend performance test:"
	@curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/health || echo "Backend not available"
	@echo "Frontend performance test:"
	@curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000 || echo "Frontend not available"

# Scripts
dev-script: ## Run development using the dev script
	@echo "Starting development environment using script..."
	./scripts/dev.sh

deploy: ## Deploy to production using the deploy script
	@echo "Deploying to production..."
	./scripts/deploy.sh production

deploy-staging: ## Deploy to staging using the deploy script
	@echo "Deploying to staging..."
	./scripts/deploy.sh staging

# Quick Commands
up: dev ## Alias for dev command
down: stop ## Alias for stop command
ps: status ## Alias for status command
