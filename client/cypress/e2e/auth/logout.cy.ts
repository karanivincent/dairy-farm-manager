describe('Logout Flow', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.validUser,
        email: `${timestamp}${users.validUser.email}`,
        username: `${users.validUser.username}${timestamp}`
      };
      
      // Register and login
      cy.register(uniqueUser);
      cy.visit('/');
    });
  });

  it('should logout successfully from menu', () => {
    // Verify logged in
    cy.contains('Dashboard').should('be.visible');
    
    // Open user menu (assuming there's a user menu dropdown)
    cy.get('[data-testid="user-menu-button"]').click();
    cy.contains('Logout').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Try to access protected route
    cy.visit('/');
    
    // Should redirect back to login
    cy.url().should('include', '/login');
  });

  it('should clear local storage on logout', () => {
    // Verify auth data exists
    cy.window().then((win) => {
      const authData = win.localStorage.getItem('auth-storage');
      expect(authData).to.not.be.null;
    });
    
    // Logout
    cy.logout();
    
    // Verify auth data is cleared
    cy.window().then((win) => {
      const authData = win.localStorage.getItem('auth-storage');
      expect(authData).to.be.null;
    });
  });

  it('should not be able to access protected routes after logout', () => {
    // Logout
    cy.logout();
    
    // Try to access different protected routes
    const protectedRoutes = ['/', '/cattle', '/production'];
    
    protectedRoutes.forEach(route => {
      cy.visit(route);
      cy.url().should('include', '/login');
    });
  });
});