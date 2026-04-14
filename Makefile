.PHONY: help build up down logs clean restart shell-backend shell-frontend shell-db dev

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

dev: ## Start services in development mode
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-db: ## Show MongoDB logs
	docker-compose logs -f mongodb

restart: ## Restart all services
	docker-compose restart

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --remove-orphans
	docker system prune -af

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-db: ## Open MongoDB shell
	docker-compose exec mongodb mongosh -u admin -p gulmigang2024

ps: ## Show running containers
	docker-compose ps

install: ## Install dependencies in all services
	docker-compose run --rm backend npm install
	docker-compose run --rm frontend npm install
