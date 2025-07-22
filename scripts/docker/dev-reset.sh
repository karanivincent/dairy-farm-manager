#!/bin/bash

echo "⚠️  WARNING: This will delete all data in your development databases!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "🔄 Resetting Daily Farm Manager development environment..."

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Start services again
./scripts/dev-up.sh

echo "✅ Development environment has been reset!"