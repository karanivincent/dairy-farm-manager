describe('Production Reports', () => {
  beforeEach(() => {
    // Login and setup test data
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      const uniqueUser = {
        ...users.validUser,
        email: `${timestamp}${users.validUser.email}`,
        username: `${users.validUser.username}${timestamp}`
      };
      
      cy.register(uniqueUser);
      
      // Add comprehensive test data
      cy.fixture('cattle').then((cattle) => {
        cy.fixture('production').then((production) => {
          // Add cattle
          const cattleIds: number[] = [];
          cattle.bulkCattle.forEach((cow: any, index: number) => {
            cy.request('POST', `${Cypress.env('apiUrl')}/cattle`, {
              ...cow,
              tagNumber: `${cow.tagNumber}-${timestamp}-${index}`
            }).then((response) => {
              cattleIds.push(response.body.id);
              
              // Add 30 days of production data
              const today = new Date();
              for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                // Morning production
                cy.request('POST', `${Cypress.env('apiUrl')}/production`, {
                  cattleId: response.body.id,
                  date: date.toISOString().split('T')[0],
                  session: 'morning',
                  quantity: 20 + Math.random() * 15
                });
                
                // Evening production
                cy.request('POST', `${Cypress.env('apiUrl')}/production`, {
                  cattleId: response.body.id,
                  date: date.toISOString().split('T')[0],
                  session: 'evening',
                  quantity: 18 + Math.random() * 12
                });
              }
            });
          });
        });
      });
      
      cy.visit('/production/reports');
    });
  });

  it('should display reports dashboard', () => {
    cy.contains('Production Reports').should('be.visible');
    cy.get('[data-testid="report-type-selector"]').should('be.visible');
    cy.get('[data-testid="generate-report"]').should('be.visible');
  });

  it('should generate daily report', () => {
    cy.get('[data-testid="report-type-selector"]').select('daily');
    cy.get('[data-testid="report-date"]').type(new Date().toISOString().split('T')[0]);
    cy.get('[data-testid="generate-report"]').click();
    
    // Verify report content
    cy.get('[data-testid="daily-report"]').should('be.visible');
    cy.get('[data-testid="morning-summary"]').should('be.visible');
    cy.get('[data-testid="evening-summary"]').should('be.visible');
    cy.get('[data-testid="total-production"]').should('be.visible');
    cy.get('[data-testid="cattle-breakdown"]').should('be.visible');
  });

  it('should generate weekly report', () => {
    cy.get('[data-testid="report-type-selector"]').select('weekly');
    cy.get('[data-testid="week-selector"]').select('current');
    cy.get('[data-testid="generate-report"]').click();
    
    // Verify weekly statistics
    cy.get('[data-testid="weekly-report"]').should('be.visible');
    cy.get('[data-testid="weekly-chart"]').should('be.visible');
    cy.get('[data-testid="daily-averages"]').should('be.visible');
    cy.get('[data-testid="week-over-week"]').should('be.visible');
  });

  it('should generate monthly report', () => {
    cy.get('[data-testid="report-type-selector"]').select('monthly');
    cy.get('[data-testid="month-selector"]').select(new Date().getMonth().toString());
    cy.get('[data-testid="year-selector"]').select(new Date().getFullYear().toString());
    cy.get('[data-testid="generate-report"]').click();
    
    // Verify monthly report
    cy.get('[data-testid="monthly-report"]').should('be.visible');
    cy.get('[data-testid="monthly-trends"]').should('be.visible');
    cy.get('[data-testid="top-producers"]').should('be.visible');
    cy.get('[data-testid="production-calendar"]').should('be.visible');
  });

  it('should generate custom period report', () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    
    cy.get('[data-testid="report-type-selector"]').select('custom');
    cy.get('[data-testid="start-date"]').type(startDate.toISOString().split('T')[0]);
    cy.get('[data-testid="end-date"]').type(endDate.toISOString().split('T')[0]);
    cy.get('[data-testid="generate-report"]').click();
    
    // Verify custom report
    cy.get('[data-testid="custom-report"]').should('be.visible');
    cy.get('[data-testid="period-summary"]').should('contain', '14 days');
  });

  it('should show production trends chart', () => {
    cy.get('[data-testid="report-type-selector"]').select('monthly');
    cy.get('[data-testid="generate-report"]').click();
    
    // Verify chart elements
    cy.get('[data-testid="trends-chart"]').should('be.visible');
    cy.get('[data-testid="chart-legend"]').should('be.visible');
    cy.get('[data-testid="chart-tooltip"]').should('not.be.visible');
    
    // Hover to show tooltip
    cy.get('[data-testid="chart-data-point"]').first().trigger('mouseover');
    cy.get('[data-testid="chart-tooltip"]').should('be.visible');
  });

  it('should compare cattle performance', () => {
    cy.get('[data-testid="report-type-selector"]').select('comparison');
    cy.get('[data-testid="comparison-period"]').select('last-30-days');
    cy.get('[data-testid="generate-report"]').click();
    
    // Verify comparison table
    cy.get('[data-testid="comparison-table"]').should('be.visible');
    cy.get('[data-testid="cattle-ranking"]').should('be.visible');
    cy.get('[data-testid="performance-metrics"]').should('be.visible');
  });

  it('should export report as PDF', () => {
    cy.get('[data-testid="report-type-selector"]').select('monthly');
    cy.get('[data-testid="generate-report"]').click();
    
    cy.get('[data-testid="export-pdf"]').click();
    cy.contains('PDF generated successfully').should('be.visible');
  });

  it('should export report as Excel', () => {
    cy.get('[data-testid="report-type-selector"]').select('monthly');
    cy.get('[data-testid="generate-report"]').click();
    
    cy.get('[data-testid="export-excel"]').click();
    cy.contains('Excel file downloaded').should('be.visible');
  });

  it('should print report', () => {
    cy.get('[data-testid="report-type-selector"]').select('daily');
    cy.get('[data-testid="generate-report"]').click();
    
    // Stub window.print
    cy.window().then(win => {
      cy.stub(win, 'print');
    });
    
    cy.get('[data-testid="print-report"]').click();
    
    // Verify print was called
    cy.window().its('print').should('be.called');
  });

  it('should save report template', () => {
    // Configure report
    cy.get('[data-testid="report-type-selector"]').select('weekly');
    cy.get('[data-testid="include-charts"]').check();
    cy.get('[data-testid="include-summary"]').check();
    
    // Save template
    cy.get('[data-testid="save-template"]').click();
    cy.get('[data-testid="template-name"]').type('Weekly Production Template');
    cy.get('[data-testid="save-template-confirm"]').click();
    
    cy.contains('Template saved').should('be.visible');
  });

  it('should load saved template', () => {
    // Create a template first
    cy.get('[data-testid="save-template"]').click();
    cy.get('[data-testid="template-name"]').type('Test Template');
    cy.get('[data-testid="save-template-confirm"]').click();
    
    // Reload page
    cy.reload();
    
    // Load template
    cy.get('[data-testid="load-template"]').click();
    cy.contains('Test Template').click();
    
    // Verify settings are restored
    cy.get('[data-testid="report-type-selector"]').should('have.value', 'daily');
  });

  it('should schedule recurring report', () => {
    cy.get('[data-testid="schedule-report"]').click();
    
    // Configure schedule
    cy.get('[data-testid="schedule-frequency"]').select('weekly');
    cy.get('[data-testid="schedule-day"]').select('monday');
    cy.get('[data-testid="schedule-time"]').type('08:00');
    cy.get('[data-testid="schedule-email"]').type('manager@farm.com');
    
    cy.get('[data-testid="save-schedule"]').click();
    cy.contains('Report scheduled successfully').should('be.visible');
  });

  it('should show report history', () => {
    cy.get('[data-testid="report-history"]').click();
    
    // Should show previously generated reports
    cy.get('[data-testid="history-list"]').should('be.visible');
    cy.get('[data-testid="history-item"]').should('have.length.at.least', 1);
    
    // View old report
    cy.get('[data-testid="history-item"]').first().click();
    cy.get('[data-testid="historical-report"]').should('be.visible');
  });
});