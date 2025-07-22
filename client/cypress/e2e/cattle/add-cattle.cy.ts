describe('Add Cattle', () => {
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
      cy.visit('/cattle/add');
    });
  });

  it('should display add cattle form', () => {
    cy.contains('Add New Cattle').should('be.visible');
    cy.get('input[name="name"]').should('be.visible');
    cy.get('input[name="tagNumber"]').should('be.visible');
    cy.get('select[name="breed"]').should('be.visible');
    cy.get('select[name="gender"]').should('be.visible');
    cy.get('input[name="birthDate"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Add Cattle');
  });

  it('should show validation errors for required fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Name is required').should('be.visible');
    cy.contains('Tag number is required').should('be.visible');
    cy.contains('Gender is required').should('be.visible');
  });

  it('should add cattle successfully', () => {
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      const newCattle = {
        ...cattle.validCattle,
        tagNumber: `NEW-${timestamp}`
      };
      
      cy.get('input[name="name"]').type(newCattle.name);
      cy.get('input[name="tagNumber"]').type(newCattle.tagNumber);
      cy.get('select[name="breed"]').select(newCattle.breed);
      cy.get('select[name="gender"]').select(newCattle.gender);
      cy.get('input[name="birthDate"]').type(newCattle.birthDate);
      cy.get('button[type="submit"]').click();
      
      // Should redirect to cattle list
      cy.url().should('include', '/cattle');
      cy.contains(`${newCattle.name} added successfully`).should('be.visible');
      
      // Verify cattle appears in list
      cy.get('[data-testid="cattle-card"]').should('contain', newCattle.name);
      cy.get('[data-testid="cattle-card"]').should('contain', newCattle.tagNumber);
    });
  });

  it('should prevent duplicate tag numbers', () => {
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      const duplicateTag = `DUP-${timestamp}`;
      
      // First add a cattle
      cy.request('POST', `${Cypress.env('apiUrl')}/cattle`, {
        ...cattle.validCattle,
        tagNumber: duplicateTag
      });
      
      // Try to add another with same tag
      cy.get('input[name="name"]').type('Duplicate Cow');
      cy.get('input[name="tagNumber"]').type(duplicateTag);
      cy.get('select[name="gender"]').select('female');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Tag number already exists').should('be.visible');
    });
  });

  it('should calculate age from birth date', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
    const formattedDate = birthDate.toISOString().split('T')[0];
    
    cy.get('input[name="birthDate"]').type(formattedDate);
    cy.get('[data-testid="age-display"]').should('contain', '2 years');
  });

  it('should handle parent selection', () => {
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      
      // Add parent cattle
      const mother = {
        ...cattle.validCattle,
        name: 'Mother Cow',
        tagNumber: `MOTHER-${timestamp}`,
        gender: 'female'
      };
      
      const father = {
        ...cattle.validCattle,
        name: 'Father Bull',
        tagNumber: `FATHER-${timestamp}`,
        gender: 'male'
      };
      
      cy.request('POST', `${Cypress.env('apiUrl')}/cattle`, mother);
      cy.request('POST', `${Cypress.env('apiUrl')}/cattle`, father);
      
      // Fill in cattle details
      cy.get('input[name="name"]').type('Baby Calf');
      cy.get('input[name="tagNumber"]').type(`CALF-${timestamp}`);
      cy.get('select[name="gender"]').select('female');
      
      // Select parents
      cy.get('[data-testid="mother-select"]').click();
      cy.contains(mother.name).click();
      
      cy.get('[data-testid="father-select"]').click();
      cy.contains(father.name).click();
      
      cy.get('button[type="submit"]').click();
      
      // Verify success
      cy.url().should('include', '/cattle');
      cy.contains('Baby Calf added successfully').should('be.visible');
    });
  });

  it('should handle photo upload', () => {
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      
      cy.get('input[name="name"]').type(cattle.validCattle.name);
      cy.get('input[name="tagNumber"]').type(`PHOTO-${timestamp}`);
      cy.get('select[name="gender"]').select(cattle.validCattle.gender);
      
      // Upload photo
      cy.get('input[type="file"]').selectFile('cypress/fixtures/cattle-photo.jpg', { force: true });
      
      // Should show preview
      cy.get('[data-testid="photo-preview"]').should('be.visible');
      
      // Remove photo
      cy.get('[data-testid="remove-photo"]').click();
      cy.get('[data-testid="photo-preview"]').should('not.exist');
      
      // Upload again
      cy.get('input[type="file"]').selectFile('cypress/fixtures/cattle-photo.jpg', { force: true });
      
      cy.get('button[type="submit"]').click();
      
      // Verify success
      cy.url().should('include', '/cattle');
    });
  });

  it('should save draft and continue later', () => {
    cy.fixture('cattle').then((cattle) => {
      const timestamp = Date.now();
      
      // Fill partial form
      cy.get('input[name="name"]').type(cattle.validCattle.name);
      cy.get('input[name="tagNumber"]').type(`DRAFT-${timestamp}`);
      
      // Save draft
      cy.get('[data-testid="save-draft"]').click();
      cy.contains('Draft saved').should('be.visible');
      
      // Navigate away
      cy.visit('/cattle');
      
      // Come back
      cy.visit('/cattle/add');
      
      // Should restore draft
      cy.get('input[name="name"]').should('have.value', cattle.validCattle.name);
      cy.get('input[name="tagNumber"]').should('have.value', `DRAFT-${timestamp}`);
      
      // Complete form
      cy.get('select[name="gender"]').select(cattle.validCattle.gender);
      cy.get('button[type="submit"]').click();
      
      // Verify success
      cy.url().should('include', '/cattle');
    });
  });

  it('should cancel and return to list', () => {
    cy.get('[data-testid="cancel-button"]').click();
    cy.url().should('include', '/cattle');
    cy.url().should('not.include', '/add');
  });
});