#!/bin/bash

# BrickFi-Lab - Development Script
# This script provides an easy way to start the development environment

set -e

echo "🏠 BrickFi-Lab - Development Setup"
echo "=================================================="

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

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    docker-compose down
    echo "✅ Development environment stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

echo ""
echo "🚀 Starting development environment..."
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the development environment"
echo ""

# Start the development environment
docker-compose up --build
