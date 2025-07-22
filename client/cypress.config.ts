import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    
    env: {
      apiUrl: 'http://localhost:3000/api/v1',
      testUser: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123@',
        firstName: 'Test',
        lastName: 'User'
      }
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});