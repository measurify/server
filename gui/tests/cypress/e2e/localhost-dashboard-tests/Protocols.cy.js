describe("create/validate and delete protocol", () => {
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
    cy.get('[href="#/protocols"]').click();
    cy.get("tr > :nth-child(1)").should("have.text", "_id");
    cy.get("tr > :nth-child(2)").should("have.text", "description");
    cy.get("tr > :nth-child(3)").should("have.text", "Management");
    cy.get(".element").should("have.text", "0");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("a > .btn > .svg-inline--fa").click();
    cy.get(":nth-child(1) > :nth-child(1) > .col-sm-2 > b").should(
      "have.text",
      "_id"
    );
    cy.get(":nth-child(2) > .col-sm-2 > b").should("have.text", "description");
    cy.get(
      ':nth-child(3) > [style="border-right-style: dotted; border-right-width: 1px;"] > b'
    ).should("have.text", "metadata");
    cy.get(":nth-child(4) > :nth-child(1) > b").should("have.text", "topics");
    cy.get("#_id").clear("te");
    cy.get("#_id").type("test-protocol");
    cy.get("#description").clear();
    cy.get("#description").type("test-protocol-description");
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).clear("m");
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).type("metadata-test-1");
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).clear("m");
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).type("metadata-test-1-description");
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-select").select(
      "text"
    );
    cy.get(":nth-child(3) > :nth-child(2) > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get(":nth-child(3) > :nth-child(3) > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get(":nth-child(3) > :nth-child(4) > .mb-3 > .form-select").should(
      "have.class",
      "form-select"
    );
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).clear("m");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(2) > .mb-3 > .form-control"
    ).type("topic-test-1");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).clear("t");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).type("topic-test-1-description");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(3) > .mb-3 > .form-control"
    ).click();
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(3) > .mb-3 > .form-control"
    ).clear();
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(3) > .mb-3 > .form-control"
    ).type("topic-field-test-1");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(4) > .mb-3 > .form-control"
    ).clear("t");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(4) > .mb-3 > .form-control"
    ).type("topic-fields-test-1-description");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(5) > .mb-3 > .form-control"
    ).clear("v");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(5) > .mb-3 > .form-control"
    ).type("vector");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(3) > :nth-child(2) > .mb-3 > .form-control"
    ).should("have.class", "form-control");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(3) > :nth-child(3) > .mb-3 > .form-control"
    ).should("have.class", "form-control");
    cy.get(
      ":nth-child(3) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(3) > .mb-3 > .form-control"
    ).should("have.class", "form-control");
    cy.get(
      ":nth-child(3) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(4) > .mb-3 > .form-control"
    ).should("have.class", "form-control");
    cy.get(
      ":nth-child(3) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(5) > .mb-3 > .form-control"
    ).should("have.class", "form-control");
    cy.get(":nth-child(2) > :nth-child(5) > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get(":nth-child(2) > :nth-child(4) > .mb-3 > .form-control").should(
      "have.class",
      "form-control"
    );
    cy.get(
      ".container-fluid > :nth-child(2) > :nth-child(3) > .mb-3 > .form-control"
    ).should("have.class", "form-control");
    cy.get(
      ":nth-child(3) > .col > :nth-child(2) > .col-sm-1 > .btn > .svg-inline--fa > path"
    ).should("be.visible");
    cy.get(
      ":nth-child(3) > .col > :nth-child(3) > .col-sm-1 > .btn > .svg-inline--fa > path"
    ).should("be.visible");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(2) > :nth-child(1) > .btn > .svg-inline--fa > path"
    ).should("be.visible");
    cy.get(
      ":nth-child(2) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > :nth-child(1) > :nth-child(2) > .btn > .svg-inline--fa"
    ).should("be.visible");
    cy.get(":nth-child(2) > :nth-child(2) > .btn > .svg-inline--fa").should(
      "be.visible"
    );
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(3) > :nth-child(1) > .btn > .svg-inline--fa > path"
    ).should("be.visible");
    cy.get(
      ":nth-child(3) > .accordion > .accordion-item > .accordion-collapse > .accordion-body > .container-fluid > .row > :nth-child(2) > .btn > .svg-inline--fa > path"
    ).should("be.visible");
    cy.get("form > .btn-primary").should("have.class", "btn-primary");
    cy.get(".btn-secondary").should("have.class", "btn-secondary");
    cy.get("form > .btn-primary").click();
    cy.get(".element").should("have.text", "1");
    cy.get(".element").should("have.class", "bg-success");
    cy.get("tbody > tr > :nth-child(1)").should("have.text", "test-protocol");
    cy.get("tbody > tr > :nth-child(2)").should(
      "have.text",
      "test-protocol-description"
    );
    cy.get(":nth-child(3) > :nth-child(1) > .svg-inline--fa > path").click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(1) > .accordion-header > .accordion-button"
    ).should("have.text", "_id");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button > b"
    ).should("have.text", "description");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(3) > :nth-child(1) > .accordion-button > b"
    ).should("have.text", "metadata");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(4) > :nth-child(1) > .accordion-button > b"
    ).should("have.text", "topics");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(1) > .accordion-collapse > .accordion-body"
    ).should("have.text", "test-protocol");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button > b"
    ).click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body"
    ).should("have.text", "test-protocol-description");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(3) > :nth-child(1) > .accordion-button > b"
    ).click();
    cy.get(
      '[style=""] > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-button > span > i'
    ).click();
    cy.get(
      '[style=""] > :nth-child(1) > .accordion > :nth-child(1) > .accordion-header > .accordion-button > b'
    ).should("have.text", "type");
    cy.get(
      '[style=""] > :nth-child(1) > .accordion > :nth-child(2) > .accordion-header > .accordion-button > b'
    ).should("have.text", "range");
    cy.get(
      '[style=""] > :nth-child(1) > .accordion > :nth-child(3) > .accordion-header > .accordion-button > b'
    ).should("have.text", "name");
    cy.get(
      '[style=""] > :nth-child(1) > .accordion > :nth-child(4) > .accordion-header > .accordion-button > b'
    ).should("have.text", "description");
    cy.get(
      ':nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(1) > .accordion-collapse > .accordion-body'
    ).should("have.text", "text");
    cy.get(
      '[style=""] > :nth-child(1) > .accordion > :nth-child(2) > .accordion-header > .accordion-button > b'
    ).click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body"
    ).should("have.text", "[ ]");
    cy.get(
      '[style=""] > :nth-child(1) > .accordion > :nth-child(3) > .accordion-header > .accordion-button'
    ).click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > .accordion > :nth-child(3) > .accordion-collapse > .accordion-body"
    ).should("have.text", "metadata-test-1");
    cy.get(
      '[style=""] > :nth-child(1) > .accordion > :nth-child(4) > .accordion-header > .accordion-button'
    ).click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > .accordion > :nth-child(4) > .accordion-collapse > .accordion-body"
    ).should("have.text", "metadata-test-1-description");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(4) > :nth-child(1) > .accordion-button"
    ).click();
    cy.get(
      ':nth-child(4) > [style=""] > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-button > span > i'
    ).click();
    cy.get(
      ':nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-header > .accordion-button > b'
    ).should("have.text", "name");
    cy.get(
      ':nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button > b'
    ).should("have.text", "description");
    cy.get(
      ':nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(1) > .accordion-button > b'
    ).should("have.text", "fields");
    cy.get(
      ':nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-collapse > .accordion-body'
    ).should("have.text", "topic-test-1");
    cy.get(
      ':nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button'
    ).click();
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body"
    ).should("have.text", "topic-test-1-description");
    cy.get(
      ":nth-child(4) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(1) > .accordion-button"
    ).click();
    cy.get(
      ".collapsing > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-button"
    ).click();
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(1) > .accordion-header > .accordion-button > b'
    ).should("have.text", "type");
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(2) > .accordion-header > .accordion-button > b'
    ).should("have.text", "range");
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(3) > .accordion-header > .accordion-button > b'
    ).should("have.text", "name");
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(4) > .accordion-header > .accordion-button > b'
    ).should("have.text", "description");
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(1) > .accordion-collapse > .accordion-body'
    ).should("have.text", "vector");
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(2) > .accordion-header > .accordion-button'
    ).click();
    cy.get(
      ":nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body"
    ).should("have.text", "[ ]");
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(3) > .accordion-header > .accordion-button'
    ).click();
    cy.get(
      ":nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > .accordion > :nth-child(3) > .accordion-collapse > .accordion-body"
    ).should("have.text", "topic-field-test-1");
    cy.get(
      ':nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(4) > .accordion-header > .accordion-button'
    ).click();
    cy.get(
      ":nth-child(1) > :nth-child(1) > :nth-child(3) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > .accordion > :nth-child(4) > .accordion-collapse > .accordion-body"
    ).should("have.text", "topic-fields-test-1-description");
    cy.get(":nth-child(2) > .svg-inline--fa > path").click();
    cy.get(".element").should("have.text", "2");
    cy.get(".element").should("have.class", "bg-success");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
  });
});
