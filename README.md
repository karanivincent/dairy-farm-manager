# Daily Farm Manager

A comprehensive Progressive Web App (PWA) for managing dairy farm operations, replacing traditional Excel-based systems with a modern, offline-capable solution.

## Features

- 📱 **Progressive Web App**: Works on all devices (mobile, tablet, desktop)
- 🔄 **Offline-First**: Full functionality without internet connection
- 🐄 **Cattle Management**: Track individual cattle profiles, breeding, and health
- 🥛 **Production Tracking**: Record daily milk production with analytics
- 💰 **Financial Management**: Income, expenses, and profitability tracking
- 📊 **Analytics & Reports**: Real-time insights and custom reports
- 🔔 **Smart Alerts**: Vaccination reminders, breeding windows, and more

## Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** with custom green theme
- **PWA** with offline support
- **IndexedDB** for local data storage

### Backend
- **NestJS** with TypeScript
- **PostgreSQL** database
- **Redis** for caching
- **TypeORM** for database management
- **JWT** authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dairy-farm-manager.git
cd dairy-farm-manager
```

2. Start the development environment:
```bash
# Start Docker services
docker-compose up -d

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

3. Access the applications:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api
- pgAdmin: http://localhost:5050

### Development Scripts

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

## Project Structure

```
dairy-farm-manager/
├── client/          # React PWA frontend
├── server/          # NestJS backend API
├── shared/          # Shared TypeScript types
├── docker/          # Docker configurations
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@dailyfarmmanager.com or create an issue in this repository.