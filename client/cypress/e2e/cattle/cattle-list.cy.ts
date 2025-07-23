describe('Cattle List View', () => {
  beforeEach(() => {
    // Login first
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.validUser,
        email: `${timestamp}${users.validUser.email}`,
        username: `${users.validUser.username}${timestamp}`
      };
      
      cy.register(uniqueUser);
      cy.visit('/cattle');
    });
  });

  it('should display cattle list page', () => {
    cy.contains('Cattle Management').should('be.visible');
    cy.get('[data-testid="add-cattle-button"]').should('be.visible');
    cy.get('[data-testid="cattle-search"]').should('be.visible');
  });

  it('should show empty state when no cattle exists', () => {
    cy.contains('No cattle yet').should('be.visible');
    cy.contains('Add your first cattle to get started').should('be.visible');
  });

  it('should navigate to add cattle page', () => {
    cy.get('[data-testid="add-cattle-button"]').click();
    cy.url().should('include', '/cattle/add');
  });

  it('should search cattle by name', () => {
    // First add some cattle
    cy.fixture('cattle').then((cattle) => {
      // Add multiple cattle via API
      cattle.bulkCattle.forEach((cow: any) => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/cattle',
          body: {
            ...cow,
            tagNumber: cow.tagNumber + Date.now()
          }
        });
      });
    });
    
    // Refresh to see the cattle
    cy.reload();
    
    // Wait for cattle to load after refresh
    cy.contains('3 cattle in your inventory', { timeout: 10000 }).should('be.visible');
    
    // Search for specific cattle
    cy.get('[data-testid="cattle-search"]').type('Daisy');
    
    // Wait for search results
    cy.wait(500); // Allow debounce to complete
    
    cy.get('[data-testid="cattle-card"]').should('have.length', 1);
    cy.contains('Daisy').should('be.visible');
  });

  it('should filter cattle by status', () => {
    // Add cattle with different statuses
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      
      // Add active cattle
      cy.authenticatedRequest({
        method: 'POST',
        url: '/cattle',
        body: {
          ...cattle.validCattle,
          tagNumber: `ACTIVE-${timestamp}`,
          status: 'active'
        }
      });
      
      // Add sold cattle
      cy.authenticatedRequest({
        method: 'POST',
        url: '/cattle',
        body: {
          ...cattle.validCattle,
          name: 'Sold Cow',
          tagNumber: `SOLD-${timestamp}`,
          status: 'sold'
        }
      });
    });
    
    // Refresh to see the cattle
    cy.reload();
    
    // Filter by active status
    cy.get('[data-testid="status-filter"]').select('active');
    cy.get('[data-testid="cattle-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Active');
    });
    
    // Filter by sold status
    cy.get('[data-testid="status-filter"]').select('sold');
    cy.get('[data-testid="cattle-card"]').should('contain', 'Sold');
  });

  it('should filter cattle by gender', () => {
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      
      // Add female cattle
      cy.authenticatedRequest({
        method: 'POST',
        url: '/cattle',
        body: {
          ...cattle.validCattle,
          tagNumber: `FEMALE-${timestamp}`,
          gender: 'female'
        }
      });
      
      // Add male cattle
      cy.authenticatedRequest({
        method: 'POST',
        url: '/cattle',
        body: {
          ...cattle.validCattle,
          name: 'Bull',
          tagNumber: `MALE-${timestamp}`,
          gender: 'male'
        }
      });
    });
    
    // Refresh to see the cattle
    cy.reload();
    
    // Filter by female
    cy.get('[data-testid="gender-filter"]').select('female');
    cy.get('[data-testid="cattle-card"]').should('contain', 'Female');
    
    // Filter by male
    cy.get('[data-testid="gender-filter"]').select('male');
    cy.get('[data-testid="cattle-card"]').should('contain', 'Male');
  });

  it('should sort cattle by different criteria', () => {
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      
      // Add cattle with different ages
      const cattleData = [
        { ...cattle.validCattle, name: 'Young', tagNumber: `Y-${timestamp}`, birthDate: '2023-01-01' },
        { ...cattle.validCattle, name: 'Old', tagNumber: `O-${timestamp}`, birthDate: '2018-01-01' },
        { ...cattle.validCattle, name: 'Middle', tagNumber: `M-${timestamp}`, birthDate: '2020-01-01' }
      ];
      
      cattleData.forEach(cow => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/cattle',
          body: cow
        });
      });
    });
    
    // Refresh to see the cattle
    cy.reload();
    
    // Sort by age (oldest first)
    cy.get('[data-testid="sort-select"]').select('age-desc');
    cy.get('[data-testid="cattle-card"]').first().should('contain', 'Old');
    
    // Sort by age (youngest first)
    cy.get('[data-testid="sort-select"]').select('age-asc');
    cy.get('[data-testid="cattle-card"]').first().should('contain', 'Young');
    
    // Sort by name
    cy.get('[data-testid="sort-select"]').select('name-asc');
    cy.get('[data-testid="cattle-card"]').first().should('contain', 'Middle');
  });

  it('should toggle between grid and list view', () => {
    // Add some cattle first
    cy.fixture('cattle').then((cattle) => {
      cattle.bulkCattle.forEach((cow: any) => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/cattle',
          body: {
            ...cow,
            tagNumber: cow.tagNumber + Date.now()
          }
        });
      });
    });
    
    cy.reload();
    
    // Default should be grid view
    cy.get('[data-testid="cattle-grid"]').should('be.visible');
    
    // Switch to list view
    cy.get('[data-testid="view-toggle-list"]').click();
    cy.get('[data-testid="cattle-list"]').should('be.visible');
    
    // Switch back to grid view
    cy.get('[data-testid="view-toggle-grid"]').click();
    cy.get('[data-testid="cattle-grid"]').should('be.visible');
  });

  it('should navigate to cattle detail page', () => {
    // Add a cattle
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      cy.authenticatedRequest({
        method: 'POST',
        url: '/cattle',
        body: {
          ...cattle.validCattle,
          tagNumber: `DETAIL-${timestamp}`
        }
      }).then((response) => {
        cy.reload();
        
        // Click on cattle card
        cy.get('[data-testid="cattle-card"]').first().click();
        cy.url().should('include', `/cattle/${response.body.id}`);
        cy.contains(cattle.validCattle.name).should('be.visible');
      });
    });
  });

  it('should handle pagination', () => {
    // Add many cattle to trigger pagination
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      const promises = [];
      
      for (let i = 0; i < 15; i++) {
        promises.push(
          cy.authenticatedRequest({
            method: 'POST',
            url: '/cattle',
            body: {
              ...cattle.validCattle,
              name: `Cow ${i}`,
              tagNumber: `PAGE-${timestamp}-${i}`
            }
          })
        );
      }
      
      cy.wrap(Promise.all(promises)).then(() => {
        cy.reload();
        
        // Should show first page
        cy.get('[data-testid="cattle-card"]').should('have.length', 10);
        
        // Navigate to second page
        cy.get('[data-testid="pagination-next"]').click();
        cy.get('[data-testid="cattle-card"]').should('have.length', 5);
        
        // Navigate back to first page
        cy.get('[data-testid="pagination-prev"]').click();
        cy.get('[data-testid="cattle-card"]').should('have.length', 10);
      });
    });
  });
});