describe("create/validate and delete thing", () => {
  it("passes", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/");
    cy.get("#username").clear("ad");
    cy.get("#username").type("admin");
    cy.get("#formBasicPassword").clear();
    cy.get("#formBasicPassword").type("adminAdmin");
    cy.get("#tenant").clear();
    cy.get("#tenant").type("test-tenant");
    cy.get("form > .btn").click();
    cy.get('[href="#/things"]').should("have.text", "Things");
    cy.get('[href="#/things"]').click();
    cy.get("tr > :nth-child(1)").should("have.text", "_id");
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("te");
    cy.get("#_id").type("test-thing");
    cy.get("#visibility").select("public");
    cy.get(":nth-child(1) > .col-sm-2 > b").should("have.text", "_id");
    cy.get(":nth-child(2) > .col-sm-2 > b").should("have.text", "visibility");
    cy.get(
      ':nth-child(3) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "tags");
    cy.get("form > .btn-primary").should("have.class", "btn-primary");
    cy.get(".btn-secondary").should("have.class", "btn-secondary");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "1");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "test-thing");
    cy.get("tr > :nth-child(2) > :nth-child(1) > .svg-inline--fa").click();
    cy.get(":nth-child(2) > .accordion-header > .accordion-button").click();
    cy.get(":nth-child(2) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "public"
    );
    cy.get(":nth-child(3) > .accordion-header > .accordion-button").click();
    cy.get(":nth-child(2) > .svg-inline--fa > path").click();
    cy.get(".element").should("have.text", "2");
    cy.get(".element").should("have.class", "bg-success");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
  });
});
