describe('Session Persistence', () => {
  let testUser: any;
  
  before(() => {
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      testUser = {
        ...users.validUser,
        email: `${timestamp}${users.validUser.email}`,
        username: `${users.validUser.username}${timestamp}`
      };
      
      // Register user once for all tests
      cy.register(testUser);
    });
  });

  it('should maintain session across page refreshes', () => {
    cy.login(testUser.email, testUser.password);
    cy.visit('/');
    
    // Verify logged in
    cy.contains('Dashboard').should('be.visible');
    
    // Refresh multiple times
    for (let i = 0; i < 3; i++) {
      cy.reload();
      cy.contains('Dashboard').should('be.visible');
    }
  });

  it('should maintain session when navigating between pages', () => {
    cy.login(testUser.email, testUser.password);
    
    // Navigate through different pages
    cy.visit('/');
    cy.contains('Dashboard').should('be.visible');
    
    cy.visit('/cattle');
    cy.url().should('include', '/cattle');
    
    cy.visit('/production');
    cy.url().should('include', '/production');
    
    cy.visit('/');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should handle expired token gracefully', () => {
    cy.login(testUser.email, testUser.password);
    cy.visit('/');
    
    // Simulate expired token by clearing auth state
    cy.window().then((win) => {
      const authData = JSON.parse(win.localStorage.getItem('auth-storage') || '{}');
      // Clear authentication data to simulate expired session
      authData.state.isAuthenticated = false;
      authData.state.token = null;
      authData.state.user = null;
      win.localStorage.setItem('auth-storage', JSON.stringify(authData));
    });
    
    // Visit a protected route
    cy.visit('/cattle');
    
    // Should redirect to login when not authenticated
    cy.url().should('include', '/login');
  });

  it('should restore previous location after login', () => {
    // Try to access protected route without login
    cy.visit('/cattle');
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Login
    cy.get('input[name="emailOrUsername"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Should redirect back to originally requested page
    cy.url().should('include', '/cattle');
  });
});