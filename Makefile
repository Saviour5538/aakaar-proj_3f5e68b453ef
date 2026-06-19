# Define variables
DOCKER_COMPOSE_FILE=docker-compose.yml

# Install dependencies
install:
	pip install -r requirements.txt
	cd frontend && npm install

# Start development environment
dev:
	./scripts/dev.sh

# Build the project
build:
	docker build -t backend:latest -f Dockerfile.backend .
	docker build -t frontend:latest -f Dockerfile.frontend .

# Run tests
test:
	pytest
	cd frontend && npm test

# Start Docker containers
docker-up:
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d

# Stop Docker containers
docker-down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

# Clean up generated files and containers
clean:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down --volumes --remove-orphans
	rm -rf backend/__pycache__
	rm -rf frontend/node_modules
	rm -rf frontend/dist