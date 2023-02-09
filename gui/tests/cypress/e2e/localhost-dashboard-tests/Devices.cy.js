describe("create/validate and delete device", () => {
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
    cy.get('[href="#/features"]').should("have.text", "Features");
    cy.get('[href="#/features"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("te");
    cy.get("#_id").type("test-feature");
    cy.get(":nth-child(2) > :nth-child(2) > .mb-3 > .form-control").clear("te");
    cy.get(":nth-child(2) > :nth-child(2) > .mb-3 > .form-control").type(
      "test-item"
    );
    cy.get(":nth-child(2) > :nth-child(3) > .mb-3 > .form-select").select(
      "number"
    );
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-control").clear("te");
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-control").type(
      "test"
    );
    cy.get(":nth-child(2) > :nth-child(5) > .mb-3 > .form-control").clear("0");
    cy.get(":nth-child(2) > :nth-child(5) > .mb-3 > .form-control").type("0");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "1");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "test-feature");
    cy.get('[href="#/devices"]').click();
    cy.get("tr > :nth-child(1)").should("have.text", "_id");
    cy.get("tr > :nth-child(2)").should("have.text", "tags");
    cy.get("tr > :nth-child(3)").should("have.text", "Management");
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("te");
    cy.get("#_id").type("test-device");
    cy.get("#features").click();
    cy.get(
      ":nth-child(1) > .col-sm-2 > .mb-3 > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > #features"
    ).clear();
    cy.get(
      ":nth-child(1) > .col-sm-2 > .mb-3 > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > #features"
    ).type("test-feature");
    cy.get("#features-option-0").click();
    cy.get(
      ":nth-child(2) > .col-sm-2 > .mb-3 > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > #features"
    ).should("be.visible");
    cy.get(":nth-child(2) > .col-sm-1 > .btn > .svg-inline--fa > path").should(
      "be.visible"
    );
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "2");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "test-device");
    cy.get("tbody > tr > :nth-child(2)").should("have.text", "[  ]");
    cy.get(":nth-child(3) > :nth-child(1) > .svg-inline--fa > path").click();
    cy.get(":nth-child(2) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(3) > .accordion-header > .accordion-button").click();
    cy.get(":nth-child(4) > .accordion-header > .accordion-button").click();
    cy.get(":nth-child(4) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "[ ]"
    );
    cy.get(":nth-child(3) > .svg-inline--fa > path").click();
    cy.get(".element").should("have.text", "3");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/features"]').click();
    cy.get(":nth-child(4) > .svg-inline--fa").click();
    cy.get(".element").should("have.text", "4");
    cy.get(".element").should("have.class", "bg-success");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
  });
});
