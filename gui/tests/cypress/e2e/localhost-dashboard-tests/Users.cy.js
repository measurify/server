describe("create/validate and delete user", () => {
  it("passes", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/");
    /* ==== Generated with Cypress Studio ==== */
    cy.get("#username").clear("ad");
    cy.get("#username").type("admin");
    cy.get("#formBasicPassword").clear();
    cy.get("#formBasicPassword").type("adminAdmin");
    cy.get("#tenant").clear();
    cy.get("#tenant").type("test-tenant");
    cy.get("form > .btn").click();
    cy.get('[href="#/users"]').should("have.text", "Users");
    cy.get('[href="#/users"]').click();
    cy.get("thead > tr > :nth-child(1)").should("have.text", "username");
    cy.get("thead > tr > :nth-child(2)").should("have.text", "type");
    cy.get("thead > tr > :nth-child(3)").should("have.text", "Management");
    cy.get("a > .btn > .svg-inline--fa").should("be.visible");
    cy.get(".page-header").should("have.class", "page-header");
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#username").clear("te");
    cy.get("#username").type("test-username");
    cy.get("#password").clear("te");
    cy.get("#password").type("test-password");
    cy.get("#email").clear("te");
    cy.get("#email").type("test@email.com");
    cy.get("#mui-2").click();
    cy.get("#mui-2-option-3").click();
    cy.get("form > .btn-primary").click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get(
      ":nth-child(1) > :nth-child(3) > :nth-child(1) > .svg-inline--fa"
    ).click();
    cy.get(":nth-child(1) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "username"
    );
    cy.get(":nth-child(1) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "test-username"
    );
    cy.get(":nth-child(2) > .accordion-header > .accordion-button").should(
      "have.text",
      "type"
    );
    cy.get(":nth-child(2) > .accordion-header > .accordion-button").click();
    cy.get(":nth-child(2) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "analyst"
    );
    cy.get(":nth-child(3) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "email"
    );
    cy.get(":nth-child(3) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(3) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "test@email.com"
    );
    cy.get(":nth-child(4) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "status"
    );
    cy.get(":nth-child(4) > .accordion-header > .accordion-button").click();
    cy.get(":nth-child(4) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "enabled"
    );
    cy.get(".element").should("have.text", "1");
    cy.get(
      ":nth-child(1) > :nth-child(3) > :nth-child(2) > .svg-inline--fa > path"
    ).click();
    cy.get(".element").should("have.text", "2");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
    /* ==== End Cypress Studio ==== */
  });
});
