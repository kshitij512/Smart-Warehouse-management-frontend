Cypress.Commands.add('loginAsAdmin', () => {

  cy.visit('/login');

  cy.intercept('POST', '/api/auth/login').as('loginRequest');

  cy.get('input[formcontrolname="email"]').type('admin@warehouse.com');
  cy.get('input[formcontrolname="password"]').type('admin123');
  cy.contains('Login').click();

  cy.wait('@loginRequest');

});

Cypress.Commands.add('loginAsStaff', () => {

  cy.visit('/login');

  cy.intercept('POST', '/api/auth/login').as('loginRequest');

  cy.get('input[formcontrolname="email"]').type('staff@warehouse.com');
  cy.get('input[formcontrolname="password"]').type('staff123');
  cy.contains('Login').click();

  cy.wait('@loginRequest');

});