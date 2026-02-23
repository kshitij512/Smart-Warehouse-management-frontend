describe('Login Flow', () => {

  it('should login successfully', () => {

    cy.visit('http://localhost:4200/login');

    cy.get('input[formcontrolname="email"]').type('admin@warehouse.com');
    cy.get('input[formcontrolname="password"]').type('admin123');

    cy.contains('Login').click();

    cy.url().should('include', '/dashboard');
  });

});