describe('Production Quick Entry', () => {
  beforeEach(() => {
    // Login and add some cattle first
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.validUser,
        email: `${timestamp}${users.validUser.email}`,
        username: `${users.validUser.username}${timestamp}`
      };
      
      cy.register(uniqueUser);
      
      // Add some cattle via API
      cy.fixture('cattle').then((cattle) => {
        cattle.bulkCattle.forEach((cow: any, index: number) => {
          cy.request('POST', `${Cypress.env('apiUrl')}/cattle`, {
            ...cow,
            tagNumber: `${cow.tagNumber}-${timestamp}-${index}`
          });
        });
      });
      
      cy.visit('/production/quick-entry');
    });
  });

  it('should display quick entry form', () => {
    cy.contains('Quick Production Entry').should('be.visible');
    cy.get('[data-testid="session-selector"]').should('be.visible');
    cy.get('[data-testid="date-input"]').should('be.visible');
    cy.get('[data-testid="cattle-production-list"]').should('be.visible');
  });

  it('should auto-select current milking session', () => {
    const currentHour = new Date().getHours();
    const expectedSession = currentHour < 12 ? 'morning' : 'evening';
    
    cy.get('[data-testid="session-selector"]').should('have.value', expectedSession);
  });

  it('should display all active cattle', () => {
    cy.get('[data-testid="cattle-entry-row"]').should('have.length.at.least', 3);
    cy.get('[data-testid="cattle-entry-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="cattle-name"]').should('not.be.empty');
      cy.wrap($row).find('[data-testid="quantity-input"]').should('be.visible');
    });
  });

  it('should enter production for single cow', () => {
    cy.fixture('production').then((production) => {
      // Enter quantity for first cow
      cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
        cy.get('[data-testid="quantity-input"]').type(production.validProduction.quantity.toString());
        cy.get('[data-testid="notes-input"]').type(production.validProduction.notes);
      });
      
      // Submit
      cy.get('[data-testid="submit-production"]').click();
      
      // Verify success
      cy.contains('Production recorded successfully').should('be.visible');
    });
  });

  it('should enter production for multiple cattle', () => {
    cy.fixture('production').then((production) => {
      // Enter quantities for multiple cattle
      production.bulkProduction.forEach((entry: any, index: number) => {
        cy.get('[data-testid="cattle-entry-row"]').eq(index).within(() => {
          cy.get('[data-testid="quantity-input"]').type(entry.quantity.toString());
        });
      });
      
      // Submit
      cy.get('[data-testid="submit-production"]').click();
      
      // Verify success
      cy.contains('3 production records saved').should('be.visible');
    });
  });

  it('should validate quantity input', () => {
    // Try negative quantity
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').type('-5');
    });
    
    cy.get('[data-testid="submit-production"]').click();
    cy.contains('Quantity must be positive').should('be.visible');
    
    // Try zero quantity
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').clear().type('0');
    });
    
    cy.get('[data-testid="submit-production"]').click();
    cy.contains('Quantity must be greater than 0').should('be.visible');
  });

  it('should handle decimal quantities', () => {
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').type('25.75');
    });
    
    cy.get('[data-testid="submit-production"]').click();
    cy.contains('Production recorded successfully').should('be.visible');
  });

  it('should use number pad on mobile', () => {
    // Check if on mobile viewport
    cy.viewport('iphone-x');
    
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').should('have.attr', 'inputmode', 'decimal');
      cy.get('[data-testid="quantity-input"]').should('have.attr', 'pattern', '[0-9]*');
    });
  });

  it('should filter cattle by search', () => {
    cy.get('[data-testid="cattle-search"]').type('Daisy');
    cy.get('[data-testid="cattle-entry-row"]').should('have.length', 1);
    cy.get('[data-testid="cattle-entry-row"]').should('contain', 'Daisy');
  });

  it('should show production summary', () => {
    cy.fixture('production').then((production) => {
      // Enter quantities
      production.bulkProduction.forEach((entry: any, index: number) => {
        cy.get('[data-testid="cattle-entry-row"]').eq(index).within(() => {
          cy.get('[data-testid="quantity-input"]').type(entry.quantity.toString());
        });
      });
      
      // Check summary
      const total = production.bulkProduction.reduce((sum: number, entry: any) => sum + entry.quantity, 0);
      cy.get('[data-testid="total-quantity"]').should('contain', total.toFixed(1));
      cy.get('[data-testid="cattle-count"]').should('contain', '3');
    });
  });

  it('should save draft and restore', () => {
    // Enter some data
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').type('25.5');
    });
    
    // Save draft
    cy.get('[data-testid="save-draft"]').click();
    cy.contains('Draft saved').should('be.visible');
    
    // Navigate away and come back
    cy.visit('/');
    cy.visit('/production/quick-entry');
    
    // Should restore draft
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').should('have.value', '25.5');
    });
  });

  it('should clear all entries', () => {
    // Enter some data
    cy.get('[data-testid="cattle-entry-row"]').each(($row, index) => {
      if (index < 3) {
        cy.wrap($row).find('[data-testid="quantity-input"]').type('20');
      }
    });
    
    // Clear all
    cy.get('[data-testid="clear-all"]').click();
    cy.get('[data-testid="confirm-clear"]').click();
    
    // All inputs should be empty
    cy.get('[data-testid="quantity-input"]').each(($input) => {
      cy.wrap($input).should('have.value', '');
    });
  });

  it('should prevent duplicate entries for same date/session', () => {
    // Submit first entry
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').type('25');
    });
    cy.get('[data-testid="submit-production"]').click();
    cy.contains('Production recorded successfully').should('be.visible');
    
    // Try to submit again for same cattle
    cy.get('[data-testid="cattle-entry-row"]').first().within(() => {
      cy.get('[data-testid="quantity-input"]').type('30');
    });
    cy.get('[data-testid="submit-production"]').click();
    
    cy.contains('Production already recorded for this session').should('be.visible');
  });
});