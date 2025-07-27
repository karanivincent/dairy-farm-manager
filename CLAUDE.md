# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daily Farm Manager is a comprehensive Progressive Web Application (PWA) for managing dairy farm operations. It provides offline-first functionality for farmers to track cattle, health records, milk production, breeding schedules, and financial transactions.

Key Features:
- Offline-first architecture with IndexedDB local storage
- Real-time sync when online
- Mobile-optimized responsive design
- Comprehensive cattle management (health, breeding, production tracking)
- Role-based access control
- PWA capabilities for installation on mobile devices

## Technology Stack

### Frontend (client/)
- React 19.1 with TypeScript
- Vite as build tool
- Tailwind CSS with custom green theme (#10b981)
- React Query for server state management
- Zustand for local state management
- Dexie.js for IndexedDB operations
- React Router v7 for routing
- Service Worker for offline functionality

### Backend (server/)
- NestJS 11 with TypeScript
- TypeORM with PostgreSQL
- Redis for caching and session management
- JWT authentication with refresh tokens
- Passport for authentication strategies
- Swagger for API documentation

### Shared (shared/)
- TypeScript types and DTOs
- Shared utilities and constants

### Infrastructure
- Docker Compose for local development
- PostgreSQL (port 5437)
- Redis (port 6379)
- pgAdmin (port 5050)

## Development Commands

### Essential Commands
```bash
# Start development environment
npm run dev              # Starts both frontend and backend with nice UI
npm run docker:up        # Start Docker services (required for database)

# Testing
npm test                 # Run all tests
npm run test:client      # Run client unit tests
npm run test:server      # Run server unit tests
npm run e2e             # Run Cypress E2E tests

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier

# Building
npm run build           # Build all packages
```

### Running Individual Tests
```bash
# Client tests
cd client && npm test -- path/to/test.test.tsx
cd client && npm run test:ui  # Interactive test UI

# Server tests
cd server && npm test -- path/to/test.spec.ts
cd server && npm run test:watch  # Watch mode
```

### Database Commands
```bash
# From server directory
npm run migration:generate -- MigrationName  # Generate migration
npm run migration:run                        # Run migrations
npm run migration:revert                     # Revert last migration
npm run seed:run                             # Run database seeds
```

## Project Structure

```
dairy-farm-manager/
├── client/                 # React PWA frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Route-specific pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # API clients, DB schemas, utilities
│   │   ├── stores/       # Zustand state stores
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets, PWA manifest
├── server/                # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # Users module
│   │   ├── cattle/       # Cattle management module
│   │   ├── production/   # Production tracking module
│   │   └── common/       # Shared utilities, guards, filters
│   └── test/             # E2E tests
└── shared/               # Shared types and utilities
```

## Key Architecture Decisions

### Frontend Architecture
- **Offline-First**: All data is stored in IndexedDB using Dexie.js, synced when online
- **State Management**: React Query for server state, Zustand for UI state
- **PWA**: Service worker with caching strategies for offline functionality
- **Mobile-First**: Bottom navigation for mobile, responsive grid layouts

### Backend Architecture
- **Modular Structure**: Each feature is a NestJS module with its own controller, service, and entities
- **Authentication**: JWT with refresh tokens, stored in httpOnly cookies
- **Database**: TypeORM with PostgreSQL, automatic migrations
- **API Design**: RESTful endpoints with OpenAPI documentation

### Testing Strategy
- **Unit Tests**: Component tests with React Testing Library, service tests with Jest
- **E2E Tests**: Cypress for frontend flows, Supertest for API endpoints
- **Mocking**: Browser APIs, fetch requests, and database connections in tests

## Current Development Status

### Phase 1 (Completed)
- ✅ User authentication with JWT
- ✅ Basic cattle CRUD operations
- ✅ Offline support with IndexedDB
- ✅ PWA setup with service worker
- ✅ Mobile-responsive design

### Phase 2 (In Progress)
- 🟡 Health records management
- 🟡 Breeding cycle tracking
- 🟡 Milk production logging
- ⬜ Basic reporting features

### Phase 3 (Planned)
- ⬜ Financial tracking
- ⬜ Feed inventory management
- ⬜ Advanced analytics
- ⬜ Multi-farm support

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - User logout

### Cattle Management
- GET /api/cattle - List all cattle (paginated)
- GET /api/cattle/:id - Get cattle details
- POST /api/cattle - Create new cattle record
- PUT /api/cattle/:id - Update cattle record
- DELETE /api/cattle/:id - Delete cattle record

### Production (Coming Soon)
- GET /api/production/milk - Milk production records
- POST /api/production/milk - Log milk production

## Important Technical Notes

### Authentication Flow
1. Login returns access token (15m) and refresh token (7d) in httpOnly cookies
2. Frontend stores user info in Zustand store
3. API requests include credentials automatically
4. Token refresh happens automatically on 401 responses

### Offline Sync Strategy
1. All data operations go through IndexedDB first
2. Background sync attempts when online
3. Conflict resolution: server data takes precedence
4. Sync status shown in UI header

### Testing Conventions
- Test files colocated with source files
- Use descriptive test names: "should [expected behavior] when [condition]"
- Mock external dependencies
- Test both success and error cases

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Prefer functional components with hooks
- Use absolute imports from @/ prefix
- Extract complex logic to custom hooks

### Git Workflow
1. Create feature branch from main
2. Make atomic commits with descriptive messages
3. Run tests before pushing
4. Create PR with description of changes
5. Ensure all checks pass before merging

## Common Development Tasks

### Adding a New Feature Module (Backend)
1. Generate module: `cd server && nest g module feature-name`
2. Add controller, service, entities
3. Register in AppModule
4. Add DTOs in shared package
5. Write unit and E2E tests

### Adding a New Page (Frontend)
1. Create page component in `client/src/pages/`
2. Add route in `App.tsx`
3. Create necessary components in `client/src/components/`
4. Add API client methods if needed
5. Write component tests

### Debugging
- Frontend: Use React DevTools and browser DevTools
- Backend: Use VS Code debugger with NestJS configuration
- Database: pgAdmin available at http://localhost:5050

## Performance Considerations
- Lazy load routes and heavy components
- Optimize images (WebP format, responsive sizes)
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Cache API responses appropriately

## Security Notes
- Never commit sensitive data (use environment variables)
- Validate all user inputs on backend
- Use parameterized queries (TypeORM handles this)
- Implement rate limiting on sensitive endpoints
- Keep dependencies updated regularly