/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via API
       * @example cy.login('test@example.com', 'password123')
       */
      login(emailOrUsername: string, password: string): Chainable<void>

      /**
       * Custom command to register a new user via API
       * @example cy.register({ email: 'new@example.com', ... })
       */
      register(userData: {
        email: string
        username: string
        password: string
        firstName: string
        lastName: string
      }): Chainable<void>

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>

      /**
       * Custom command to seed test data
       * @example cy.seedTestData()
       */
      seedTestData(): Chainable<void>

      /**
       * Custom command to clean up test data
       * @example cy.cleanupTestData()
       */
      cleanupTestData(): Chainable<void>

      /**
       * Custom command to make authenticated API requests
       * @example cy.authenticatedRequest({ method: 'POST', url: '/cattle', body: {...} })
       */
      authenticatedRequest(options: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<any>>
    }
  }
}

// Login command
Cypress.Commands.add('login', (emailOrUsername: string, password: string) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
    emailOrUsername,
    password
  }).then((response) => {
    window.localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: response.body.user,
        token: response.body.accessToken,
        refreshToken: response.body.refreshToken,
        isAuthenticated: true
      }
    }));
    cy.visit('/');
  });
});

// Register command
Cypress.Commands.add('register', (userData) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, userData).then((response) => {
    window.localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: response.body.user,
        token: response.body.accessToken,
        refreshToken: response.body.refreshToken,
        isAuthenticated: true
      }
    }));
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('auth-storage');
  cy.visit('/login');
});

// Seed test data
Cypress.Commands.add('seedTestData', () => {
  // This would typically make API calls to set up test data
  cy.log('Seeding test data...');
});

// Cleanup test data
Cypress.Commands.add('cleanupTestData', () => {
  // This would typically make API calls to clean up test data
  cy.log('Cleaning up test data...');
});

// Authenticated request command
Cypress.Commands.add('authenticatedRequest', (options: Partial<Cypress.RequestOptions>) => {
  return cy.window().then((win) => {
    const authData = JSON.parse(win.localStorage.getItem('auth-storage') || '{}');
    const token = authData?.state?.token;
    
    return cy.request({
      ...options,
      url: options.url?.startsWith('http') 
        ? options.url 
        : `${Cypress.env('apiUrl') || 'http://localhost:3000/api/v1'}${options.url}`,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  });
});

export {};