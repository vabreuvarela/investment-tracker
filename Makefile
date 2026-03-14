.PHONY: help setup build build-docker start stop logs clean install dev migrate migrate-down postman

# Variables
PROJECT_NAME := investment-tracker
DOCKER_COMPOSE := docker-compose -f docker-compose.yml

help:
	@echo "$(PROJECT_NAME) - Available commands:"
	@echo ""
	@echo "  make setup          - Install dependencies and prepare the project"
	@echo "  make build          - Build the TypeScript project"
	@echo "  make build-docker   - Build Docker images"
	@echo "  make start          - Start API and PostgreSQL with docker-compose"
	@echo "  make stop           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-api       - View logs from API service only"
	@echo "  make logs-db        - View logs from PostgreSQL service only"
	@echo "  make ps             - Show running services"
	@echo "  make migrate        - Run database migrations"
	@echo "  make migrate-down   - Rollback database migrations"
	@echo "  make postman        - Generate Postman collection from Express routes"
	@echo "  make clean          - Stop services and remove containers"
	@echo "  make clean-all      - Stop services, remove containers and volumes"
	@echo "  make install        - Install npm dependencies"
	@echo "  make dev            - Run API in development mode (local, no Docker)"
	@echo "  make test           - Run tests"
	@echo ""

# Setup and installation
setup: install build
	@echo "✓ Project setup complete"

install:
	@echo "Installing dependencies..."
	npm install
	@echo "✓ Dependencies installed"

build:
	@echo "Building TypeScript..."
	npm run build
	@echo "✓ Build complete"

build-docker:
	@echo "Building Docker images..."
	$(DOCKER_COMPOSE) build
	@echo "✓ Docker images built"

# Running services
start: build-docker
	@echo "Starting services with docker-compose..."
	$(DOCKER_COMPOSE) up -d
	@echo "✓ Services started"
	@echo ""
	@echo "API available at: http://localhost:3000"
	@echo "PostgreSQL available at: localhost:5432"
	@echo ""
	@echo "Use 'make logs' to view service logs"

stop:
	@echo "Stopping services..."
	$(DOCKER_COMPOSE) down
	@echo "✓ Services stopped"

restart: stop start
	@echo "✓ Services restarted"

# Logs
logs:
	$(DOCKER_COMPOSE) logs -f

logs-api:
	$(DOCKER_COMPOSE) logs -f api

logs-db:
	$(DOCKER_COMPOSE) logs -f postgres

ps:
	$(DOCKER_COMPOSE) ps

# Cleanup
clean:
	@echo "Stopping and removing containers..."
	$(DOCKER_COMPOSE) down
	@echo "✓ Cleanup complete"

clean-all:
	@echo "Stopping services, removing containers and volumes..."
	$(DOCKER_COMPOSE) down -v
	@echo "✓ Full cleanup complete"

# Development
dev:
	@echo "Starting API in development mode (local)..."
	npm run dev

# Database Migrations
migrate:
	@echo "Running database migrations..."
	npm run migrate
	@echo "✓ Migrations completed"

migrate-down:
	@echo "Rolling back database migrations..."
	npm run migrate:down
	@echo "✓ Rollback completed"

test:
	@echo "Running tests..."
	npm test

# Documentation
postman:
	@echo "Generating Postman collection from Express routes..."
	@echo "Note: express-to-postman requires manual route inspection or a separate OpenAPI spec"
	@echo "For now, use Postman's import feature with the API running at http://localhost:3000"
	@echo "✓ See AGENTS.md for route documentation"

.DEFAULT_GOAL := help
