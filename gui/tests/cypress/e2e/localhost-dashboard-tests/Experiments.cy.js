describe("create/validate and delete experiment", () => {
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
    cy.get('[href="#/protocols"]').should("have.text", "Protocols");
    cy.get('[href="#/experiments"]').should("have.text", "Experiments");
    cy.get('[href="#/protocols"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get("#_id").clear("te");
    cy.get("#_id").type("testProtocol");
    cy.get("#description").clear();
    cy.get("#description").type("testProtocolDesc");
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).type("metadata1");
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).type("metadata1desc");
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-select").select(
      "scalar"
    );
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).type("topic1");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).type("topic1desc");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(3) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(3) > .mb-3 > .form-control"
    ).type("field1");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(4) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(4) > .mb-3 > .form-control"
    ).type("field1desc");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(5) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(5) > .mb-3 > .form-control"
    ).type("scalar");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "1");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/experiments"]').click();
    cy.get("a > .btn > .svg-inline--fa").click();

    cy.get("#_id").clear("t");
    cy.get("#_id").type("test-experiment");
    cy.get("#description").clear("de");
    cy.get("#description").type("descr");
    cy.get("#state").clear("0");
    cy.get("#state").type("0");
    cy.get("#startDate").clear("2");
    cy.get("#startDate").type("2020/01/01");
    cy.get("#endDate").clear("2");
    cy.get("#endDate").type("2020/01/01");
    cy.get("#manager").clear("s");
    cy.get("#manager").type("self");
    cy.get(".col-sm-2 > .mb-3 > .form-control").click();
    cy.get(":nth-child(2) > .col-sm-2 > .mb-3 > .form-control").clear();
    cy.get(":nth-child(2) > .col-sm-2 > .mb-3 > .form-control").type("Rome");
    cy.get(":nth-child(3) > .col-sm-2 > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get("#manager").should("have.class", "form-control");
    cy.get("#endDate").should("have.class", "form-control");
    cy.get("#startDate").should("have.class", "form-control");
    cy.get("#state").should("have.class", "form-control");
    cy.get("#description").should("have.class", "form-control");
    cy.get("#_id").should("have.class", "form-control");
    cy.get(".container-fluid > :nth-child(1) > .col-sm-2 > b").should(
      "have.text",
      "_id"
    );
    cy.get(":nth-child(2) > .col-sm-2 > b").should("have.text", "description");
    cy.get(":nth-child(3) > .col-sm-2 > b").should("have.text", "state");
    cy.get(":nth-child(4) > .col-sm-2 > b").should("have.text", "startDate");
    cy.get(":nth-child(5) > .col-sm-2 > b").should("have.text", "endDate");
    cy.get(":nth-child(6) > .col-sm-2 > b").should("have.text", "manager");
    cy.get(
      ':nth-child(7) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "place");
    cy.get(".form-select").select("testProtocol");
    cy.get(":nth-child(8) > .col-sm-2 > b").should("have.text", "protocol");
    cy.get("#protocol").should("have.value", "testProtocol");
    cy.get("#protocol").should("have.class", "form-control");
    cy.get(
      ':nth-child(9) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "metadata");
    cy.get(
      ":nth-child(9) > .col > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).click();
    cy.get("form > .btn-primary").should("have.class", "btn-primary");
    cy.get(".btn-secondary").should("have.class", "btn-secondary");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "2");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("thead > tr > :nth-child(1)").should("have.text", "_id");
    cy.get("thead > tr > :nth-child(2)").should("have.text", "description");
    cy.get("thead > tr > :nth-child(3)").should("have.text", "protocol");
    cy.get("thead > tr > :nth-child(4)").should("have.text", "Management");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "test-experiment");
    cy.get("tbody > tr > :nth-child(2)").should("have.text", "descr");
    cy.get("tbody > tr > :nth-child(3)").should("have.text", "testProtocol");
    cy.get(":nth-child(4) > :nth-child(1) > .svg-inline--fa > path").click();
    cy.get(":nth-child(10) > .accordion-header > .accordion-button > b").should(
      "have.text",
      "history"
    );
    cy.get(":nth-child(2) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(2) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "descr"
    );
    cy.get(":nth-child(3) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(3) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "0"
    );
    cy.get(":nth-child(4) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(4) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "2020/01/01"
    );
    cy.get(":nth-child(5) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(5) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "2020/01/01"
    );
    cy.get(":nth-child(6) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(6) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "self"
    );

    cy.get(":nth-child(7) > .accordion-header > .accordion-button").click();
    cy.get(
      ":nth-child(7) > .accordion-collapse > .accordion-body > .table-responsive > .table > thead > tr > :nth-child(1)"
    ).should("have.text", "name");

    cy.get(
      ":nth-child(7) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > tr > :nth-child(1)"
    ).should("have.text", "Rome");

    cy.get(":nth-child(8) > .accordion-header > .accordion-button > b").click();
    cy.get(":nth-child(8) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "testProtocol"
    );

    cy.get(":nth-child(9) > .accordion-header > .accordion-button").click();
    cy.get(
      ":nth-child(9) > .accordion-collapse > .accordion-body > .table-responsive > .table > thead > tr > :nth-child(1)"
    ).should("have.text", "name");

    cy.get(
      ".accordion-body > .table-responsive > .table > thead > tr > :nth-child(2)"
    ).should("have.text", "value");

    cy.get(
      ":nth-child(9) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > tr > :nth-child(1)"
    ).should("have.text", "metadata1");

    cy.get(
      ".accordion-body > .table-responsive > .table > tbody > tr > :nth-child(2)"
    ).should("have.text", "0");

    cy.get(
      ":nth-child(10) > .accordion-header > .accordion-button > b"
    ).click();
    cy.get(":nth-child(10) > .accordion-collapse > .accordion-body").should(
      "have.text",
      "[ ]"
    );
    cy.get(":nth-child(4) > .svg-inline--fa").click();
    cy.get(".element").should("have.text", "3");
    cy.get(".element").should("have.class", "bg-success");
    cy.get('[href="#/protocols"]').click();
    cy.get(":nth-child(2) > .svg-inline--fa > path").click();
    cy.get(".element").should("have.text", "4");
    cy.get(".element").should("have.class", "bg-success");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
  });
});
