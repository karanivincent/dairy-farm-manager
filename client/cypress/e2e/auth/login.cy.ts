describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('h2').should('contain', 'Sign in to your account');
    cy.get('input[name="emailOrUsername"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign in');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email or username is required').should('be.visible');
    cy.contains('Password must be at least 6 characters').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[name="emailOrUsername"]').type(users.invalidCredentials.emailOrUsername);
      cy.get('input[name="password"]').type(users.invalidCredentials.password);
      cy.get('button[type="submit"]').click();
      
      // Wait for error message
      cy.contains('Invalid credentials', { timeout: 10000 }).should('be.visible');
    });
  });

  it('should login successfully with email', () => {
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueEmail = timestamp + users.validUser.email;
      const uniqueUsername = users.validUser.username + timestamp;
      
      // First register a user
      cy.visit('/register');
      cy.get('input[name="firstName"]').type(users.validUser.firstName);
      cy.get('input[name="lastName"]').type(users.validUser.lastName);
      cy.get('input[name="username"]').type(uniqueUsername);
      cy.get('input[name="email"]').type(uniqueEmail);
      cy.get('input[name="password"]').type(users.validUser.password);
      cy.get('input[name="confirmPassword"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Logout
      cy.logout();
      
      // Now test login with email
      cy.get('input[name="emailOrUsername"]').type(uniqueEmail);
      cy.get('input[name="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains(`Welcome back, ${users.validUser.firstName}!`).should('be.visible');
    });
  });

  it('should login successfully with username', () => {
    cy.fixture('users').then((users) => {
      const uniqueUsername = users.validUser.username + Date.now();
      const uniqueEmail = Date.now() + users.validUser.email;
      
      // First register a user
      cy.visit('/register');
      cy.get('input[name="firstName"]').type(users.validUser.firstName);
      cy.get('input[name="lastName"]').type(users.validUser.lastName);
      cy.get('input[name="username"]').type(uniqueUsername);
      cy.get('input[name="email"]').type(uniqueEmail);
      cy.get('input[name="password"]').type(users.validUser.password);
      cy.get('input[name="confirmPassword"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Logout
      cy.logout();
      
      // Now test login with username
      cy.get('input[name="emailOrUsername"]').type(uniqueUsername);
      cy.get('input[name="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains(`Welcome back, ${users.validUser.firstName}!`).should('be.visible');
    });
  });

  it('should toggle password visibility', () => {
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    cy.get('input[name="password"]').parent().find('button').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    cy.get('input[name="password"]').parent().find('button').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
  });

  it('should navigate to register page', () => {
    cy.contains('Sign up').click();
    cy.url().should('include', '/register');
  });

  it('should persist login state after page refresh', () => {
    cy.fixture('users').then((users) => {
      const uniqueEmail = Date.now() + users.validUser.email;
      
      // Register and login
      cy.register({
        ...users.validUser,
        email: uniqueEmail,
        username: users.validUser.username + Date.now()
      });
      
      cy.visit('/');
      
      // Verify logged in
      cy.contains('Dashboard').should('be.visible');
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.contains('Dashboard').should('be.visible');
    });
  });
});