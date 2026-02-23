describe('Warehouse Flow', () => {

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should create warehouse', () => {

    cy.visit('/warehouses');

    cy.get('input[placeholder="Warehouse Name"]').type('Test Hub');

    cy.contains('Create').click();

    cy.contains('Warehouse created successfully');
  });

});