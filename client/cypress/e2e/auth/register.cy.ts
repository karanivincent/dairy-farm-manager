describe('Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display registration form', () => {
    cy.get('h2').should('contain', 'Create your account');
    cy.get('input[name="firstName"]').should('be.visible');
    cy.get('input[name="lastName"]').should('be.visible');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Create account');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('First name must be at least 2 characters').should('be.visible');
    cy.contains('Last name must be at least 2 characters').should('be.visible');
    cy.contains('Username must be at least 3 characters').should('be.visible');
    cy.contains('Please enter a valid email address').should('be.visible');
    cy.contains('Password must be at least 6 characters').should('be.visible');
  });

  it('should show error for weak password', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[name="firstName"]').type(users.weakPassword.firstName);
      cy.get('input[name="lastName"]').type(users.weakPassword.lastName);
      cy.get('input[name="username"]').type(users.weakPassword.username);
      cy.get('input[name="email"]').type(users.weakPassword.email);
      cy.get('input[name="password"]').type(users.weakPassword.password);
      cy.get('input[name="confirmPassword"]').type(users.weakPassword.password);
      cy.get('button[type="submit"]').click();
      
      cy.contains('Password must be at least 6 characters').should('be.visible');
    });
  });

  it('should show error for password mismatch', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[name="firstName"]').type(users.newUser.firstName);
      cy.get('input[name="lastName"]').type(users.newUser.lastName);
      cy.get('input[name="username"]').type(users.newUser.username);
      cy.get('input[name="email"]').type(users.newUser.email);
      cy.get('input[name="password"]').type(users.newUser.password);
      cy.get('input[name="confirmPassword"]').type('DifferentPassword123@');
      cy.get('button[type="submit"]').click();
      
      cy.contains("Passwords don't match").should('be.visible');
    });
  });

  it('should register successfully', () => {
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.newUser,
        email: `${timestamp}${users.newUser.email}`,
        username: `${users.newUser.username}${timestamp}`
      };
      
      cy.get('input[name="firstName"]').type(uniqueUser.firstName);
      cy.get('input[name="lastName"]').type(uniqueUser.lastName);
      cy.get('input[name="username"]').type(uniqueUser.username);
      cy.get('input[name="email"]').type(uniqueUser.email);
      cy.get('input[name="password"]').type(uniqueUser.password);
      cy.get('input[name="confirmPassword"]').type(uniqueUser.password);
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains(`Welcome, ${uniqueUser.firstName}!`).should('be.visible');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  it('should show error for duplicate email', () => {
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.newUser,
        email: `duplicate${timestamp}@example.com`,
        username: `unique${timestamp}`
      };
      
      // First registration
      cy.register(uniqueUser);
      
      // Try to register with same email
      cy.visit('/register');
      cy.get('input[name="firstName"]').type(uniqueUser.firstName);
      cy.get('input[name="lastName"]').type(uniqueUser.lastName);
      cy.get('input[name="username"]').type(`different${timestamp}`);
      cy.get('input[name="email"]').type(uniqueUser.email);
      cy.get('input[name="password"]').type(uniqueUser.password);
      cy.get('input[name="confirmPassword"]').type(uniqueUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.contains('Email already exists').should('be.visible');
    });
  });

  it('should show error for duplicate username', () => {
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.newUser,
        email: `unique${timestamp}@example.com`,
        username: `duplicate${timestamp}`
      };
      
      // First registration
      cy.register(uniqueUser);
      
      // Try to register with same username
      cy.visit('/register');
      cy.get('input[name="firstName"]').type(uniqueUser.firstName);
      cy.get('input[name="lastName"]').type(uniqueUser.lastName);
      cy.get('input[name="username"]').type(uniqueUser.username);
      cy.get('input[name="email"]').type(`different${timestamp}@example.com`);
      cy.get('input[name="password"]').type(uniqueUser.password);
      cy.get('input[name="confirmPassword"]').type(uniqueUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.contains('Username already exists').should('be.visible');
    });
  });

  it('should toggle password visibility', () => {
    // Password field
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    cy.get('input[name="password"]').parent().find('button').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    
    // Confirm password field
    cy.get('input[name="confirmPassword"]').should('have.attr', 'type', 'password');
    cy.get('input[name="confirmPassword"]').parent().find('button').click();
    cy.get('input[name="confirmPassword"]').should('have.attr', 'type', 'text');
  });

  it('should navigate to login page', () => {
    cy.contains('Sign in').click();
    cy.url().should('include', '/login');
  });

  it('should validate backend password requirements', () => {
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      
      // Test password without special character
      cy.get('input[name="firstName"]').type(users.newUser.firstName);
      cy.get('input[name="lastName"]').type(users.newUser.lastName);
      cy.get('input[name="username"]').type(`test${timestamp}`);
      cy.get('input[name="email"]').type(`${timestamp}@example.com`);
      cy.get('input[name="password"]').type('Password123'); // No special character
      cy.get('input[name="confirmPassword"]').type('Password123');
      cy.get('button[type="submit"]').click();
      
      // Should show backend validation error
      cy.contains('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', { timeout: 10000 }).should('be.visible');
    });
  });
});