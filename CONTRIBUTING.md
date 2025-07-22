# Contributing to Daily Farm Manager

Thank you for your interest in contributing to Daily Farm Manager! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/dairy-farm-manager.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit with conventional commits
6. Push to your fork
7. Create a Pull Request

## Development Setup

Follow the instructions in the [README.md](README.md) to set up your development environment.

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow the ESLint configuration
- Use functional components and hooks in React
- Maintain type safety - avoid `any` types

### Styling
- Use Tailwind CSS utility classes
- Follow the established green theme color palette
- Ensure responsive design for all screen sizes
- Maintain consistent spacing and typography

### Git Commit Messages

We use conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(cattle): add photo upload functionality

- Implemented camera integration for mobile devices
- Added image compression before upload
- Updated cattle detail view with photo gallery
```

### Code Review Process

1. All code must be reviewed before merging
2. Address all review comments
3. Ensure all tests pass
4. Update documentation if needed

### Testing

- Write unit tests for all new features
- Maintain minimum 80% code coverage
- Run tests before submitting PR: `npm run test`
- Include integration tests for API endpoints

### API Design

- Follow RESTful principles
- Use proper HTTP status codes
- Include comprehensive error messages
- Document all endpoints with Swagger

### Database Changes

- Create migrations for all schema changes
- Never modify existing migrations
- Test migrations both up and down
- Document any data transformations

## Pull Request Process

1. **Before submitting:**
   - Run `npm run lint` and fix any issues
   - Run `npm run test` and ensure all pass
   - Update documentation if needed
   - Rebase on latest main branch

2. **PR Description should include:**
   - Summary of changes
   - Related issue numbers
   - Screenshots for UI changes
   - Breaking changes (if any)

3. **Review process:**
   - At least one approval required
   - All CI checks must pass
   - No merge conflicts

## Project Structure Guidelines

### Frontend (React)
```
src/
├── components/     # Reusable components
│   ├── common/    # Generic components
│   └── features/  # Feature-specific components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API services
├── store/         # State management
├── types/         # TypeScript types
└── utils/         # Utility functions
```

### Backend (NestJS)
```
src/
├── modules/       # Feature modules
├── common/        # Shared code
├── config/        # Configuration
├── database/      # Database related
└── main.ts        # Application entry
```

## Questions?

Feel free to open an issue for any questions about contributing.