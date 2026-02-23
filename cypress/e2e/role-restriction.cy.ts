describe('Role Restriction', () => {

  it('staff should not see create warehouse button', () => {

    cy.loginAsStaff();

    cy.visit('/warehouses');

    cy.contains('Create Warehouse').should('not.exist');
  });

});