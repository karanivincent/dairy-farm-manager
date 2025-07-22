#!/bin/bash

# Display logs from Docker services
# Usage: ./dev-logs.sh [service_name]

if [ -z "$1" ]; then
  echo "📋 Showing logs for all services..."
  docker-compose logs -f
else
  echo "📋 Showing logs for $1..."
  docker-compose logs -f $1
fi