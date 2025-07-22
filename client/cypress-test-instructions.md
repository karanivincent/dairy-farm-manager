# Cypress E2E Testing Instructions

## Prerequisites

Before running the tests, ensure:
1. Backend server is running on http://localhost:3000
   ```bash
   cd server
   npm run start:dev
   ```

2. Frontend dev server is running on http://localhost:5173
   ```bash
   cd client
   npm run dev
   ```

## Running Tests

### Interactive Mode (Recommended for Development)
```bash
npm run cypress:open
```
This opens the Cypress Test Runner where you can:
- Select E2E Testing
- Choose a browser (Chrome, Firefox, etc.)
- Click on test files to run them individually
- See tests execute in real-time

### Headless Mode (For CI/CD)
```bash
npm run e2e
# or
npm run cypress:run
```

### Headed Mode (See browser but run all tests)
```bash
npm run e2e:headed
```

## Test Structure

### Authentication Tests
- `cypress/e2e/auth/login.cy.ts` - Login functionality
- `cypress/e2e/auth/register.cy.ts` - User registration
- `cypress/e2e/auth/logout.cy.ts` - Logout functionality
- `cypress/e2e/auth/session-persistence.cy.ts` - Session management

### Cattle Management Tests
- `cypress/e2e/cattle/cattle-list.cy.ts` - Viewing and filtering cattle
- `cypress/e2e/cattle/add-cattle.cy.ts` - Adding new cattle

### Production Tracking Tests
- `cypress/e2e/production/quick-entry.cy.ts` - Quick production entry
- `cypress/e2e/production/production-history.cy.ts` - Viewing production history
- `cypress/e2e/production/production-reports.cy.ts` - Generating reports

## Test Data

Test fixtures are located in `cypress/fixtures/`:
- `users.json` - Test user data
- `cattle.json` - Test cattle data
- `production.json` - Test production data

## Custom Commands

Available custom Cypress commands in `cypress/support/commands.ts`:
- `cy.login(emailOrUsername, password)` - Login via API
- `cy.register(userData)` - Register new user via API
- `cy.logout()` - Clear session and logout
- `cy.seedTestData()` - Seed test data (placeholder)
- `cy.cleanupTestData()` - Clean up test data (placeholder)

## Troubleshooting

### Tests Failing Due to Timing
If tests fail due to elements not being ready, increase timeout:
```javascript
cy.get('[data-testid="element"]', { timeout: 10000 })
```

### CORS Issues
Ensure backend CORS is configured to accept requests from http://localhost:5173

### Database State
Tests may fail if database already contains conflicting data. Consider:
1. Using a separate test database
2. Clearing data before test runs
3. Using unique identifiers (timestamps) in test data

## Writing New Tests

1. Create test file in appropriate directory under `cypress/e2e/`
2. Use data-testid attributes for selecting elements
3. Follow existing test patterns
4. Add fixtures for test data when needed

Example:
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    cy.login('test@example.com', 'Password123@');
    cy.visit('/feature-page');
  });

  it('should do something', () => {
    cy.get('[data-testid="element"]').click();
    cy.contains('Expected text').should('be.visible');
  });
});
```

## Best Practices

1. **Use data-testid**: Add `data-testid` attributes to elements for reliable selection
2. **Avoid hard-coded waits**: Use Cypress's built-in retry-ability instead of `cy.wait()`
3. **Keep tests independent**: Each test should be able to run in isolation
4. **Use fixtures**: Store test data in fixture files
5. **Clean up**: Reset state between tests when necessary