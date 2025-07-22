#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up PostgreSQL for Daily Farm Manager...${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Try to connect with current user or postgres user
echo "Creating database and user..."

# Set PostgreSQL port
PGPORT=5437

# First try with current user, then fallback to postgres
if psql -U $USER -d postgres -p $PGPORT -c '\q' 2>/dev/null; then
    PSQL_USER=$USER
elif psql -U postgres -p $PGPORT -c '\q' 2>/dev/null; then
    PSQL_USER=postgres
else
    echo -e "${RED}Could not connect to PostgreSQL on port $PGPORT. Please ensure it's running.${NC}"
    exit 1
fi

echo "Using PostgreSQL user: $PSQL_USER on port $PGPORT"

# Create user and database
psql -U $PSQL_USER -d postgres -p $PGPORT << EOF
-- Create user if not exists
DO
\$do\$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_user
      WHERE usename = 'farm_user') THEN
      CREATE USER farm_user WITH PASSWORD 'farm_pass';
   END IF;
END
\$do\$;

-- Create database if not exists
SELECT 'CREATE DATABASE farm_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'farm_db')\\gexec

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE farm_db TO farm_user;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
    echo -e "${GREEN}  Database: farm_db${NC}"
    echo -e "${GREEN}  User: farm_user${NC}"
    echo -e "${GREEN}  Password: farm_pass${NC}"
else
    echo -e "${RED}✗ Failed to set up database. Please check your PostgreSQL installation.${NC}"
    exit 1
fi