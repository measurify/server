describe("create/validate and delete feature", () => {
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
    cy.get('[href="#/features"]').should("have.text", "Features");
    cy.get('[href="#/features"]').click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get("tr > :nth-child(1)").should("have.text", "_id");
    cy.get("tr > :nth-child(2)").should("have.text", "Management");
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get(".container-fluid > :nth-child(1) > .col-sm-2 > b").should(
      "have.text",
      "_id"
    );
    cy.get(
      ':nth-child(2) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "items");
    cy.get(
      ':nth-child(3) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "tags");
    cy.get("#_id").clear("te");
    cy.get("#_id").type("test-feature");
    cy.get(":nth-child(2) > :nth-child(2) > .mb-3 > .form-control").clear("te");
    cy.get(":nth-child(2) > :nth-child(2) > .mb-3 > .form-control").type(
      "test-item"
    );
    cy.get(":nth-child(2) > :nth-child(3) > .mb-3 > .form-select").select(
      "text"
    );
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-control").clear("te");
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-control").type(
      "test/s"
    );
    cy.get(":nth-child(2) > :nth-child(5) > .mb-3 > .form-control").clear("0");
    cy.get(":nth-child(2) > :nth-child(5) > .mb-3 > .form-control").type("0");
    cy.get(":nth-child(3) > :nth-child(2) > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get(":nth-child(3) > :nth-child(3) > .mb-3 > .form-select").should(
      "have.class",
      "form-select"
    );
    cy.get(":nth-child(3) > :nth-child(4) > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get(":nth-child(3) > :nth-child(5) > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get("#tags-label").should("have.text", "Enter tags[0]");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "1");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "test-feature");
    cy.get("tr > :nth-child(2) > :nth-child(1) > .svg-inline--fa").click();
    cy.get(":nth-child(2) > .accordion-header > .accordion-button").click();
    cy.get(":nth-child(2) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "[ ]"
    );
    cy.get(":nth-child(4) > .svg-inline--fa > path").click();
    cy.get(".element").should("have.text", "2");
    cy.get(".element").should("have.class", "bg-success");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
    /* ==== End Cypress Studio ==== */
  });
});
