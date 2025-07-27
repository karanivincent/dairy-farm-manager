#!/bin/bash

echo "🚀 Setting up Docker containers for Daily Farm Manager..."

# Remove the credential helper temporarily
export DOCKER_CONFIG=~/.docker
if [ -f "$DOCKER_CONFIG/config.json" ]; then
    echo "Backing up Docker config..."
    cp "$DOCKER_CONFIG/config.json" "$DOCKER_CONFIG/config.json.backup"
    # Remove credential helper
    cat "$DOCKER_CONFIG/config.json" | sed 's/"credsStore".*,//g' > "$DOCKER_CONFIG/config.json.tmp"
    mv "$DOCKER_CONFIG/config.json.tmp" "$DOCKER_CONFIG/config.json"
fi

echo "📦 Starting containers..."
docker-compose up -d postgres redis

echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
echo "🔍 Checking services..."
docker-compose ps

echo "✅ Setup complete!"
echo ""
echo "Your credentials from .env file:"
echo "  Database: postgresql://farm_user:farm_pass@localhost:5437/farm_db"
echo "  Redis: redis://localhost:6379"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f"