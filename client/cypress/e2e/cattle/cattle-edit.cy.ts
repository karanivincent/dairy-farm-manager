describe('Cattle Edit Flow', () => {
  let testUser: any;
  
  beforeEach(() => {
    // Create a unique test user
    cy.fixture('users').then((users) => {
      const timestamp = Date.now();
      testUser = {
        ...users.validUser,
        email: `test${timestamp}@example.com`,
        username: `testuser${timestamp}`
      };
      
      // Register and login the test user
      cy.register(testUser);
      cy.visit('/');
    });
    
    // Create a test cattle record
    cy.intercept('POST', '/api/v1/cattle', {
      statusCode: 201,
      body: {
        id: 123,
        name: 'Test Cattle',
        tagNumber: 'TEST-001',
        gender: 'Female',
        status: 'Active',
        breed: 'Holstein',
        birthDate: '2022-01-15',
        parentBullId: null,
        parentCowId: null,
        metadata: {
          birthWeight: 35.5,
          birthType: 'single',
          healthNotes: 'Healthy calf',
        },
      },
    }).as('createCattle');

    // Mock the cattle detail response
    cy.intercept('GET', '/api/v1/cattle/123', {
      statusCode: 200,
      body: {
        id: 123,
        name: 'Test Cattle',
        tagNumber: 'TEST-001',
        gender: 'Female',
        status: 'Active',
        breed: 'Holstein',
        birthDate: '2022-01-15',
        parentBullId: null,
        parentCowId: null,
        metadata: {
          birthWeight: 35.5,
          birthType: 'single',
          healthNotes: 'Healthy calf',
        },
      },
    }).as('getCattle');

    // Mock breeds list
    cy.intercept('GET', '/api/v1/cattle/breeds', {
      statusCode: 200,
      body: ['Holstein', 'Jersey', 'Angus', 'Hereford'],
    }).as('getBreeds');

    // Mock tag check (for edit mode, should not be called)
    cy.intercept('GET', '/api/v1/cattle/check-tag/*', {
      statusCode: 200,
      body: { exists: false },
    }).as('checkTag');

    // Mock parent search
    cy.intercept('GET', '/api/v1/cattle?gender=male*', {
      statusCode: 200,
      body: {
        data: [
          { id: 10, name: 'Bull Alpha', tagNumber: 'BULL-001', gender: 'Male' },
          { id: 11, name: 'Bull Beta', tagNumber: 'BULL-002', gender: 'Male' },
        ],
      },
    }).as('searchBulls');

    cy.intercept('GET', '/api/v1/cattle?gender=female*', {
      statusCode: 200,
      body: {
        data: [
          { id: 20, name: 'Cow Delta', tagNumber: 'COW-101', gender: 'Female' },
          { id: 21, name: 'Cow Echo', tagNumber: 'COW-102', gender: 'Female' },
        ],
      },
    }).as('searchCows');
  });

  it('should load cattle data and display in edit form', () => {
    cy.visit('/cattle/123/edit');
    
    cy.wait('@getCattle');
    cy.wait('@getBreeds');
    
    // Check header
    cy.contains('h1', 'Edit Cattle: Test Cattle').should('be.visible');
    cy.contains('Update the information for this cattle record').should('be.visible');
    
    // Check form is populated with data
    cy.get('input[name="name"]').should('have.value', 'Test Cattle');
    cy.get('input[name="tagNumber"]').should('have.value', 'TEST-001');
    cy.get('select[name="gender"]').should('have.value', 'Female');
    cy.get('input[name="birthDate"]').should('have.value', '2022-01-15');
    cy.get('select[name="breed"]').should('have.value', 'Holstein');
  });

  it('should navigate through form steps', () => {
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Step 1: Basic Information
    cy.contains('Basic Information').should('be.visible');
    cy.get('button').contains('Next').click();
    
    // Step 2: Breeding Details
    cy.contains('Breeding Details').should('be.visible');
    cy.get('input[name="birthWeight"]').should('have.value', '35.5');
    cy.get('select[name="birthType"]').should('have.value', 'single');
    cy.get('button').contains('Previous').click();
    
    // Back to Step 1
    cy.contains('Basic Information').should('be.visible');
    cy.get('button').contains('Next').click();
    
    // Step 2 again
    cy.get('button').contains('Next').click();
    
    // Step 3: Health Status
    cy.contains('Health Status').should('be.visible');
    cy.get('textarea[name="healthNotes"]').should('have.value', 'Healthy calf');
    cy.get('button').contains('Next').click();
    
    // Step 4: Photo
    cy.contains('Photo').should('be.visible');
    cy.get('button').contains('Save Changes').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Clear required fields
    cy.get('input[name="name"]').clear();
    cy.get('input[name="tagNumber"]').clear();
    
    // Try to go to next step
    cy.get('button').contains('Next').click();
    
    // Should show validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Tag number is required').should('be.visible');
    
    // Fill required fields
    cy.get('input[name="name"]').type('Updated Name');
    cy.get('input[name="tagNumber"]').type('UPDATED-001');
    
    // Should now be able to proceed
    cy.get('button').contains('Next').click();
    cy.contains('Breeding Details').should('be.visible');
  });

  it('should handle optional fields correctly', () => {
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Navigate to breeding details
    cy.get('button').contains('Next').click();
    
    // Clear optional fields
    cy.get('input[name="birthWeight"]').clear();
    
    // Should be able to proceed without validation errors
    cy.get('button').contains('Next').click();
    cy.contains('Health Status').should('be.visible');
    
    // Clear health notes
    cy.get('textarea[name="healthNotes"]').clear();
    
    // Should be able to proceed
    cy.get('button').contains('Next').click();
    cy.contains('Photo').should('be.visible');
  });

  it('should update cattle successfully', () => {
    cy.intercept('PATCH', '/api/v1/cattle/123', {
      statusCode: 200,
      body: {
        id: 123,
        name: 'Updated Cattle',
        tagNumber: 'UPDATED-001',
        gender: 'Female',
        status: 'Active',
        breed: 'Jersey',
        birthDate: '2022-01-15',
      },
    }).as('updateCattle');
    
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Update basic info
    cy.get('input[name="name"]').clear().type('Updated Cattle');
    cy.get('input[name="tagNumber"]').clear().type('UPDATED-001');
    cy.get('select[name="breed"]').select('Jersey');
    
    // Navigate to last step
    cy.get('button').contains('Next').click(); // To Breeding Details
    cy.get('button').contains('Next').click(); // To Health Status
    cy.get('button').contains('Next').click(); // To Photo
    
    // Save changes
    cy.get('button').contains('Save Changes').click();
    
    // Wait for update request
    cy.wait('@updateCattle').then((interception) => {
      expect(interception.request.body).to.deep.include({
        name: 'Updated Cattle',
        tagNumber: 'UPDATED-001',
        breed: 'Jersey',
      });
    });
    
    // Should redirect to cattle detail page
    cy.url().should('include', '/cattle/123');
    cy.url().should('not.include', '/edit');
  });

  it('should handle parent selection', () => {
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Navigate to breeding details
    cy.get('button').contains('Next').click();
    
    // Search for bull
    cy.get('input[placeholder*="Search for bull"]').type('Alpha');
    cy.wait('@searchBulls');
    
    // Select a bull
    cy.contains('Bull Alpha').click();
    cy.contains('Selected: Bull Alpha').should('be.visible');
    
    // Clear selection
    cy.contains('Clear').click();
    cy.contains('Selected: Bull Alpha').should('not.exist');
    
    // Search for cow
    cy.get('input[placeholder*="Search for cow"]').type('Delta');
    cy.wait('@searchCows');
    
    // Select a cow
    cy.contains('Cow Delta').click();
    cy.contains('Selected: Cow Delta').should('be.visible');
  });

  it('should handle update errors gracefully', () => {
    cy.intercept('PATCH', '/api/v1/cattle/123', {
      statusCode: 400,
      body: {
        message: 'Tag number already exists',
      },
    }).as('updateError');
    
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Navigate to last step
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Next').click();
    
    // Try to save
    cy.get('button').contains('Save Changes').click();
    
    // Wait for error
    cy.wait('@updateError');
    
    // Should show error toast
    cy.contains('Tag number already exists').should('be.visible');
    
    // Should remain on edit page
    cy.url().should('include', '/cattle/123/edit');
  });

  it('should handle cancel action', () => {
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Make some changes
    cy.get('input[name="name"]').clear().type('Changed Name');
    
    // Click cancel
    cy.get('button').contains('Cancel').click();
    
    // Should redirect to detail page without saving
    cy.url().should('include', '/cattle/123');
    cy.url().should('not.include', '/edit');
  });

  it('should navigate using step indicators', () => {
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Click on step 3 indicator
    cy.get('[role="button"]').contains('3').click();
    
    // Should jump to Health Status step
    cy.contains('Health Status').should('be.visible');
    
    // Click on step 1 indicator
    cy.get('[role="button"]').contains('1').click();
    
    // Should jump back to Basic Information
    cy.contains('Basic Information').should('be.visible');
  });

  it('should not check for duplicate tag in edit mode', () => {
    cy.visit('/cattle/123/edit');
    cy.wait('@getCattle');
    
    // Change tag number
    cy.get('input[name="tagNumber"]').clear().type('NEW-TAG-001');
    
    // Wait a bit to ensure no tag check is made
    cy.wait(1000);
    
    // Verify checkTag was not called
    cy.get('@checkTag.all').should('have.length', 0);
  });
});