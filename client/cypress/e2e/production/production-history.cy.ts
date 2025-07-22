describe('Production History', () => {
  beforeEach(() => {
    // Login and add test data
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.validUser,
        email: `${timestamp}${users.validUser.email}`,
        username: `${users.validUser.username}${timestamp}`
      };
      
      cy.register(uniqueUser);
      
      // Add cattle and production records via API
      cy.fixture('cattle').then((cattle) => {
        cy.fixture('production').then((production) => {
          // Add cattle
          cattle.bulkCattle.forEach((cow: any, index: number) => {
            cy.request('POST', `${Cypress.env('apiUrl')}/cattle`, {
              ...cow,
              tagNumber: `${cow.tagNumber}-${timestamp}-${index}`
            }).then((response) => {
              // Add production records for each cattle
              const today = new Date();
              for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                cy.request('POST', `${Cypress.env('apiUrl')}/production`, {
                  cattleId: response.body.id,
                  date: date.toISOString().split('T')[0],
                  session: 'morning',
                  quantity: 25 + Math.random() * 10
                });
                
                cy.request('POST', `${Cypress.env('apiUrl')}/production`, {
                  cattleId: response.body.id,
                  date: date.toISOString().split('T')[0],
                  session: 'evening',
                  quantity: 22 + Math.random() * 8
                });
              }
            });
          });
        });
      });
      
      cy.visit('/production/history');
    });
  });

  it('should display production history page', () => {
    cy.contains('Production History').should('be.visible');
    cy.get('[data-testid="date-range-selector"]').should('be.visible');
    cy.get('[data-testid="production-table"]').should('be.visible');
  });

  it('should filter by date range', () => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    cy.get('[data-testid="start-date"]').type(threeDaysAgo.toISOString().split('T')[0]);
    cy.get('[data-testid="end-date"]').type(today.toISOString().split('T')[0]);
    cy.get('[data-testid="apply-filter"]').click();
    
    // Should show only records from last 3 days
    cy.get('[data-testid="production-row"]').should('have.length.at.least', 1);
  });

  it('should filter by cattle', () => {
    cy.get('[data-testid="cattle-filter"]').click();
    cy.contains('Daisy').click();
    cy.get('[data-testid="apply-filter"]').click();
    
    // Should show only Daisy's records
    cy.get('[data-testid="production-row"]').each(($row) => {
      cy.wrap($row).should('contain', 'Daisy');
    });
  });

  it('should filter by session', () => {
    cy.get('[data-testid="session-filter"]').select('morning');
    
    // Should show only morning records
    cy.get('[data-testid="production-row"]').each(($row) => {
      cy.wrap($row).should('contain', 'Morning');
    });
  });

  it('should sort by different columns', () => {
    // Sort by date descending (default)
    cy.get('[data-testid="sort-date"]').click();
    cy.get('[data-testid="production-row"]').first().should('contain', new Date().toLocaleDateString());
    
    // Sort by quantity descending
    cy.get('[data-testid="sort-quantity"]').click();
    cy.get('[data-testid="production-row"]').then(($rows) => {
      const quantities = Array.from($rows).map(row => 
        parseFloat(row.querySelector('[data-testid="quantity-value"]')?.textContent || '0')
      );
      expect(quantities).to.deep.equal([...quantities].sort((a, b) => b - a));
    });
  });

  it('should show daily summary', () => {
    cy.get('[data-testid="view-toggle"]').click();
    cy.get('[data-testid="daily-summary-view"]').click();
    
    // Should show aggregated daily totals
    cy.get('[data-testid="daily-summary-row"]').should('be.visible');
    cy.get('[data-testid="daily-summary-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="morning-total"]').should('exist');
      cy.wrap($row).find('[data-testid="evening-total"]').should('exist');
      cy.wrap($row).find('[data-testid="daily-total"]').should('exist');
    });
  });

  it('should export to Excel', () => {
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="export-excel"]').click();
    
    // Verify download started (check for success message)
    cy.contains('Export started').should('be.visible');
  });

  it('should export to PDF', () => {
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="export-pdf"]').click();
    
    // Verify PDF generation
    cy.contains('PDF generated').should('be.visible');
  });

  it('should show production statistics', () => {
    cy.get('[data-testid="stats-panel"]').should('be.visible');
    cy.get('[data-testid="total-production"]').should('be.visible');
    cy.get('[data-testid="average-per-day"]').should('be.visible');
    cy.get('[data-testid="average-per-cow"]').should('be.visible');
    cy.get('[data-testid="production-trend"]').should('be.visible');
  });

  it('should edit production record', () => {
    cy.get('[data-testid="production-row"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });
    
    // Edit form should appear
    cy.get('[data-testid="edit-modal"]').should('be.visible');
    cy.get('[data-testid="edit-quantity"]').clear().type('30');
    cy.get('[data-testid="save-edit"]').click();
    
    // Verify update
    cy.contains('Production updated').should('be.visible');
    cy.get('[data-testid="production-row"]').first().should('contain', '30');
  });

  it('should delete production record', () => {
    cy.get('[data-testid="production-row"]').first().within(() => {
      cy.get('[data-testid="delete-button"]').click();
    });
    
    // Confirm deletion
    cy.get('[data-testid="confirm-delete"]').click();
    
    // Verify deletion
    cy.contains('Production deleted').should('be.visible');
  });

  it('should show empty state when no records', () => {
    // Filter to a date with no records
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    cy.get('[data-testid="start-date"]').type(futureDate.toISOString().split('T')[0]);
    cy.get('[data-testid="end-date"]').type(futureDate.toISOString().split('T')[0]);
    cy.get('[data-testid="apply-filter"]').click();
    
    cy.contains('No production records found').should('be.visible');
  });

  it('should paginate results', () => {
    // Ensure we have many records by setting a wide date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    cy.get('[data-testid="start-date"]').type(startDate.toISOString().split('T')[0]);
    cy.get('[data-testid="apply-filter"]').click();
    
    // Check pagination
    cy.get('[data-testid="pagination"]').should('be.visible');
    cy.get('[data-testid="next-page"]').click();
    cy.get('[data-testid="page-info"]').should('contain', 'Page 2');
  });
});