/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    loginAsAdmin(): Chainable<void>;
    loginAsStaff(): Chainable<void>;
  }
}