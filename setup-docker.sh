#!/bin/bash

echo "🚀 Setting up GulmiGang with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env files from examples
if [ -f "backend/.env.example" ]; then
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env from example"
    else
        echo "⏩ backend/.env already exists"
    fi
fi

if [ -f "frontend/.env.example" ]; then
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        echo "✅ Created frontend/.env from example"
    else
        echo "⏩ frontend/.env already exists"
    fi
fi

echo ""
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ GulmiGang is now running!"
echo ""
echo "📱 Frontend: http://localhost:5178"
echo "🔧 Backend API: http://localhost:5007"
echo "🗄️  MongoDB: mongodb://localhost:27017"
echo ""
echo "📋 Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart: docker-compose restart"
echo "  • Clean everything: docker-compose down -v"
echo ""
echo "Or use make commands:"
echo "  • make up    - Start all services"
echo "  • make down  - Stop all services"
echo "  • make logs  - View logs"
echo "  • make clean - Clean everything"
echo ""
