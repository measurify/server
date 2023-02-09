describe("create/validate and delete role", () => {
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
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[href="#/roles"]').should("have.text", "Roles");
    cy.get('[href="#/roles"]').click();
    cy.get("thead > tr > :nth-child(1)").should("have.text", "_id");
    cy.get("thead > tr > :nth-child(2)").should("have.text", "Management");
    cy.get("a > .btn > .svg-inline--fa").should("be.visible");
    cy.get(".element").should("have.text", "0");
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("te");
    cy.get("#_id").type("test-role");
    cy.get(":nth-child(3) > :nth-child(2) > .mb-3 > .form-select").select(
      "none"
    );
    cy.get(":nth-child(3) > :nth-child(3) > .mb-3 > .form-select").select(
      "none"
    );
    cy.get(":nth-child(3) > :nth-child(4) > .mb-3 > .form-select").select(
      "none"
    );
    cy.get(".col-sm-2 > .mb-3 > .form-control").click();
    cy.get(":nth-child(2) > .col-sm-2 > .mb-3 > .form-control").clear();
    cy.get(":nth-child(2) > .col-sm-2 > .mb-3 > .form-control").type("tag");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(1) > .mb-3 > .form-check > .form-check-input"
    ).check();
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(1) > .mb-3 > .form-check > .form-check-input"
    ).check();
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(2) > .mb-3 > .form-select"
    ).select("all");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(3) > .mb-3 > .form-select"
    ).select("all");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(4) > .mb-3 > .form-select"
    ).select("all");
    cy.get(":nth-child(2) > .col-sm-1 > .btn > .svg-inline--fa").should(
      "have.class",
      "fa-times"
    );
    cy.get(":nth-child(1) > :nth-child(1) > .col-sm-2 > b").should(
      "have.text",
      "_id"
    );
    cy.get(
      ':nth-child(4) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "actions");
    cy.get(":nth-child(3) > .col-sm-2 > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-header > .accordion-button > b"
    ).should("have.text", "crud");
    cy.get(
      ":nth-child(3) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(2) > .mb-3 > .form-select"
    ).should("have.class", "form-select");
    cy.get(
      ":nth-child(3) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(3) > .mb-3 > .form-select"
    ).should("have.class", "form-select");
    cy.get(
      ":nth-child(3) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(4) > .mb-3 > .form-select"
    ).should("have.class", "form-select");
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get('form > .btn-primary').should('have.class', 'btn-primary');
    cy.get('.btn-secondary').should('have.class', 'btn-secondary');
    cy.get('.element').should('have.text', '0');
    cy.get('form > .btn-primary').click();
    cy.get('tbody > :nth-child(5) > :nth-child(1)').should('have.text', 'test-role');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(1) > .svg-inline--fa > path').click();
    cy.get('.popover-body > :nth-child(1) > :nth-child(1) > .accordion-header > .accordion-button > b').should('have.text', '_id');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button > b').should('have.text', 'default');
    cy.get(':nth-child(3) > :nth-child(1) > .accordion-button').should('have.text', 'actions');
    cy.get('.popover-body > :nth-child(1) > :nth-child(1) > .accordion-collapse > .accordion-body').should('have.text', 'test-role');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button > b').click();
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(1) > b').should('have.text', 'create');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(1) > b').should('have.text', 'read');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(1) > b').should('have.text', 'update');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(1) > b').should('have.text', 'delete');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(2)').should('have.text', 'false');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(2)').should('have.text', 'none');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(2)').should('have.text', 'none');
    cy.get('.popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(2)').should('have.text', 'none');
    cy.get(':nth-child(3) > :nth-child(1) > .accordion-button').click();
    cy.get('[style=""] > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-button').click();
    cy.get(':nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(1) > .accordion-collapse > .accordion-body').should('have.text', 'tag');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-header > .accordion-button').click();
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(1) > b').should('have.text', 'create');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(1) > b').should('have.text', 'read');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(1) > b').should('have.text', 'update');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(1) > b').should('have.text', 'delete');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(2)').should('have.text', 'true');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(2)').should('have.text', 'all');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(2)').should('have.text', 'all');
    cy.get(':nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(2)').should('have.text', 'all');
    cy.get('.page-content').click();
    cy.get('.element').should('have.text', '1');
    cy.get(':nth-child(5) > :nth-child(2) > :nth-child(2) > .svg-inline--fa').click();
    cy.get('.element').should('have.text', '2');
    cy.get('[style="padding-left: 20px; padding-bottom: 20px;"] > .btn').click();
    /* ==== End Cypress Studio ==== */
  });
});
