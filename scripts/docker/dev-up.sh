#!/bin/bash

echo "🚀 Starting Daily Farm Manager development environment..."

# Start Docker services
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if PostgreSQL is ready
until docker exec farm_postgres pg_isready -U farm_user > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Check if Redis is ready
until docker exec farm_redis redis-cli ping > /dev/null 2>&1; do
  echo "Waiting for Redis..."
  sleep 2
done

echo "✅ All services are up and running!"
echo ""
echo "📍 Service URLs:"
echo "   PostgreSQL: localhost:5437"
echo "   Redis: localhost:6379"
echo "   pgAdmin: http://localhost:5050"
echo ""
echo "🔐 Credentials:"
echo "   PostgreSQL: farm_user / farm_pass"
echo "   pgAdmin: admin@farm.local / admin"