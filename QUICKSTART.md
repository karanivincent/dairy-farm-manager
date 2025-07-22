# Daily Farm Manager - Quick Start Guide

## 🚀 Starting the Application

### Option 1: Recommended (with colored output)
```bash
npm run dev
# OR
npm start
```
Both commands do the same thing - start frontend and backend with nice colored output.

### Option 2: Docker Environment (alternative)
```bash
npm run docker:up    # Start PostgreSQL, Redis, pgAdmin in Docker
npm run dev          # Start frontend and backend
npm run docker:down  # Stop Docker services when done
```

### Option 3: Manual Start
```bash
# Terminal 1 - Backend
cd server && npm run start:dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

## 📱 Access Points

Once running, access the application at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

## 🗄️ Database Setup

### First Time Setup
```bash
npm run db:setup
```

### Manual Setup
```bash
psql -U vince -d postgres -p 5437
CREATE USER farm_user WITH PASSWORD 'farm_pass';
CREATE DATABASE farm_db;
GRANT ALL PRIVILEGES ON DATABASE farm_db TO farm_user;
\q
```

## 🛠️ Available Scripts

- `npm start` - Start both frontend and backend
- `npm run start:all` - Start with all service checks
- `npm run dev` - Start with colored output and URLs
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run db:setup` - Set up PostgreSQL database

## 🔧 Environment Variables

The `.env` file in the server directory contains:
- Database connection (port 5437)
- JWT secrets
- API configuration

## 📋 Prerequisites

- Node.js v18+
- PostgreSQL (running on port 5437)
- npm or yarn

## 🆘 Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running on port 5437
- Run `npm run db:setup` to create the database

### Port Already in Use
- Frontend runs on port 5173
- Backend runs on port 3000
- Kill existing processes: `lsof -ti:5173 | xargs kill -9`

### Dependencies Issues
```bash
npm run install:all
```