describe("create/validate and delete measurement", () => {
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
    cy.get('[href="#/features"]').should("have.text", "Features");
    cy.get('[href="#/tags"]').should("have.text", "Tags");
    cy.get('[href="#/devices"]').should("have.text", "Devices");
    cy.get('[href="#/measurements"]').should("have.text", "Measurements");
    cy.get('[href="#/tags"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("t");
    cy.get("#_id").type("testTag");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "1");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "testTag");
    cy.get("thead > tr > :nth-child(1)").should("have.text", "_id");
    cy.get('[href="#/things"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("t");
    cy.get("#_id").type("testThing");
    cy.get("#visibility").select("public");
    cy.get("#tags").click();
    cy.get("#tags-option-0").click();
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "2");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("thead > tr > :nth-child(1)").should("have.text", "_id");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "testThing");
    cy.get('[href="#/features"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("t");
    cy.get("#_id").type("testFeature");
    cy.get(":nth-child(2) > :nth-child(2) > .mb-3 > .form-control").clear("i");
    cy.get(":nth-child(2) > :nth-child(2) > .mb-3 > .form-control").type(
      "item1"
    );
    cy.get(":nth-child(2) > :nth-child(3) > .mb-3 > .form-select").select(
      "number"
    );
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-control").clear("u");
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-control").type(
      "unit1"
    );
    cy.get(":nth-child(2) > :nth-child(5) > .mb-3 > .form-control").clear("0");
    cy.get(":nth-child(2) > :nth-child(5) > .mb-3 > .form-control").type("0");
    cy.get("#tags").click();
    cy.get("#tags-option-0").click();
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "3");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("thead > tr > :nth-child(1)").should("have.text", "_id");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "testFeature");
    cy.get('[href="#/devices"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("t");
    cy.get("#_id").type("testDevice");
    cy.get("#features").click();
    cy.get("#features-option-0").click();
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "4");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("thead > tr > :nth-child(1)").should("have.text", "_id");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "testDevice");
    cy.get(".element").should("have.text", "4");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/measurements"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get(".form-select").select("testFeature");
    cy.get(".accordion-button").click();
    cy.get("#item1").clear("5");
    cy.get("#item1").type("5");
    cy.get("#mui-4").click();
    cy.get("#mui-4-option-0").click();
    cy.get("#mui-2").click();
    cy.get("#mui-2-option-0").click();
    cy.get("#tags").click();
    cy.get("#tags-option-0").click();
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "5");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("thead > tr > :nth-child(1)").should("have.text", "thing");
    cy.get("thead > tr > :nth-child(2)").should("have.text", "feature");
    cy.get("thead > tr > :nth-child(3)").should("have.text", "device");
    cy.get("thead > tr > :nth-child(4)").should("have.text", "startDate");
    cy.get("thead > tr > :nth-child(5)").should("have.text", "tags");
    cy.get("tbody > tr > :nth-child(5)").should("have.text", "[ testTag ]");
    cy.get("tbody > tr > :nth-child(3)").should("have.text", "testDevice");
    cy.get("tbody > tr > :nth-child(2)").should("have.text", "testFeature");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "testThing");
    cy.get(":nth-child(6) > :nth-child(1) > .svg-inline--fa > path").click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(1) > .accordion-header > .accordion-button > b"
    ).should("have.text", "thing");
    cy.get(":nth-child(2) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "feature"
    );
    cy.get(":nth-child(3) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "device"
    );
    cy.get(":nth-child(4) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "startDate"
    );
    cy.get(":nth-child(5) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "visibility"
    );
    cy.get(":nth-child(6) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "tags"
    );
    cy.get(":nth-child(7) > :nth-child(1) > .accordion-button > b").should(
      "have.text",
      "samples"
    );
    cy.get(":nth-child(2) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(2) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "testFeature"
    );

    cy.get(":nth-child(3) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(3) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "testDevice"
    );
    cy.get(":nth-child(5) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(5) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "private"
    );
    cy.get(":nth-child(6) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(6) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "[ testTag ]"
    );
    cy.get(":nth-child(7) > :nth-child(1) > .accordion-button").click();
    cy.get(
      ".collapsing > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-button"
    ).click();
    cy.get(
      ":nth-child(1) > .accordion > .accordion-item > .accordion-header > .accordion-button > b"
    ).should("have.text", "values");
    cy.get(":nth-child(6) > :nth-child(1) > .svg-inline--fa > path").click();
    cy.get(
      ':nth-child(1) > [style=""] > :nth-child(1) > .accordion > .accordion-item > .accordion-collapse > .accordion-body'
    ).should("have.text", "[ 5 ]");
    cy.get(":nth-child(3) > .svg-inline--fa").click();
    cy.get(".element").should("have.text", "6");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/devices"]').click();
    cy.get(":nth-child(3) > .svg-inline--fa").click();
    cy.get(".element").should("have.text", "7");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/features"]').click();
    cy.get(":nth-child(4) > .svg-inline--fa > path").click();
    cy.get(".element").should("have.text", "8");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/things"]').click();
    cy.get(":nth-child(2) > .svg-inline--fa > path").click();
    cy.get(".element").should("have.text", "9");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/tags"]').click();
    cy.get(":nth-child(3) > .svg-inline--fa").click();
    cy.get(".element").should("have.text", "10");
    cy.get(".element").should("have.class", "bg-success");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
  });
});
