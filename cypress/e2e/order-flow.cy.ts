describe('Order Lifecycle', () => {

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should complete order lifecycle', () => {

    cy.visit('/orders');

    cy.contains('Change Status').select('CONFIRMED');
    cy.contains('Change Status').select('PICKING');
    cy.contains('Change Status').select('PACKED');
    cy.contains('Change Status').select('SHIPPED');
    cy.contains('Change Status').select('DELIVERED');

    cy.contains('DELIVERED');
  });

});