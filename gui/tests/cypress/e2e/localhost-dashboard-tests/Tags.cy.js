describe("create/validate and delete 2 tags", () => {
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
    cy.get('[href="#/tags"]').should("have.text", "Tags");
    cy.get('[href="#/tags"]').click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get("tr > :nth-child(1)").should("have.text", "_id");
    cy.get("tr > :nth-child(2)").should("have.text", "Management");
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("te");
    cy.get("#_id").type("test-tag");
    cy.get(":nth-child(1) > .col-sm-2 > b").should("have.text", "_id");
    cy.get(
      ':nth-child(2) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "tags");
    cy.get(".col-sm-1 > .btn > .svg-inline--fa > path").should("be.visible");
    cy.get(".element").should("have.text", "0");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "1");
    cy.get(".page-header > a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("y");
    cy.get("#_id").type("test-tag2");
    cy.get(".MuiFormControl-root").click();
    cy.get(
      ":nth-child(1) > .col-sm-2 > .mb-3 > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > #tags"
    ).clear();
    cy.get(
      ":nth-child(1) > .col-sm-2 > .mb-3 > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > #tags"
    ).type("test-tag");
    cy.get("#tags-option-0").click();
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "2");
    cy.get("tbody > :nth-child(2) > :nth-child(1)").should(
      "have.text",
      "test-tag"
    );
    cy.get("tbody > :nth-child(1) > :nth-child(1)").should(
      "have.text",
      "test-tag2"
    );
    cy.get(
      ":nth-child(1) > :nth-child(2) > :nth-child(1) > .svg-inline--fa > path"
    ).click();
    cy.get(".accordion-body").should("have.text", "[ test-tag ]");

    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get(".page-content").click();
    cy.get(
      "tbody > :nth-child(2) > :nth-child(2) > :nth-child(1) > .svg-inline--fa > path"
    ).click();
    cy.get(".accordion-button > b").should("have.text", "tags");
    cy.get(
      ":nth-child(1) > :nth-child(2) > :nth-child(3) > .svg-inline--fa > path"
    ).click();
    cy.get(":nth-child(3) > .svg-inline--fa").click();
    cy.get(".element").should("have.text", "4");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
    /* ==== End Cypress Studio ==== */
  });
});
