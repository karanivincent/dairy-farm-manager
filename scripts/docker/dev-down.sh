#!/bin/bash

echo "🛑 Stopping Daily Farm Manager development environment..."

# Stop Docker services
docker-compose down

echo "✅ All services have been stopped."