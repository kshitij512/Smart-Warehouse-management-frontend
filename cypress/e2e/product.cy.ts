describe('Product Flow', () => {

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should create product', () => {

    cy.visit('/products');

    cy.get('input[placeholder="SKU"]').type('TEST-100');
    cy.get('input[placeholder="Product Name"]').type('Test Product');
    cy.get('input[placeholder="Price"]').clear().type('100');

    cy.contains('Create').click();

    cy.contains('Product created successfully');
  });

});