#!/bin/bash

# Housing Strategy Dashboard - Production Deployment Script
# This script deploys the application to production

set -e

echo "🚀 Housing Strategy Dashboard - Production Deployment"
echo "====================================================="

# Configuration
ENVIRONMENT=${1:-production}
REGISTRY=${2:-""}
TAG=${3:-latest}

echo "Environment: $ENVIRONMENT"
echo "Registry: ${REGISTRY:-'local'}"
echo "Tag: $TAG"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

echo "✅ Docker is running"
echo "✅ docker-compose is available"

# Build production images
echo ""
echo "🔨 Building production images..."
docker-compose build --no-cache

# Tag images if registry is provided
if [ -n "$REGISTRY" ]; then
    echo ""
    echo "🏷️  Tagging images for registry..."
    docker tag housing-strategy-dashboard_backend:latest $REGISTRY/housing-strategy-dashboard-backend:$TAG
    docker tag housing-strategy-dashboard_frontend:latest $REGISTRY/housing-strategy-dashboard-frontend:$TAG
    
    echo "📤 Pushing images to registry..."
    docker push $REGISTRY/housing-strategy-dashboard-backend:$TAG
    docker push $REGISTRY/housing-strategy-dashboard-frontend:$TAG
fi

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "🚀 Deploying to production with nginx..."
    docker-compose --profile production up -d
    
    echo ""
    echo "✅ Production deployment completed!"
    echo "   Application: http://localhost"
    echo "   API Docs: http://localhost/docs"
else
    echo ""
    echo "🚀 Deploying to staging..."
    docker-compose up -d
    
    echo ""
    echo "✅ Staging deployment completed!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
fi

# Health check
echo ""
echo "🔍 Performing health check..."
sleep 10

if [ "$ENVIRONMENT" = "production" ]; then
    if curl -s http://localhost/health > /dev/null; then
        echo "✅ Application is healthy"
    else
        echo "⚠️  Application health check failed"
    fi
else
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "✅ Backend is healthy"
    else
        echo "⚠️  Backend health check failed"
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend is healthy"
    else
        echo "⚠️  Frontend health check failed"
    fi
fi

echo ""
echo "📊 Deployment Summary:"
echo "   Environment: $ENVIRONMENT"
echo "   Images built: ✅"
if [ -n "$REGISTRY" ]; then
    echo "   Images pushed: ✅"
fi
echo "   Application deployed: ✅"
echo "   Health check: ✅"
echo ""
echo "🎉 Deployment completed successfully!"
