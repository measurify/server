describe("auth page/ add tenant tenant page/login/logout", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/");
    /* ==== Generated with Cypress Studio ==== */
    cy.get("#username").should("have.id", "username");
    cy.get("#formBasicPassword").should("have.id", "formBasicPassword");
    cy.get("#tenant").should("have.id", "tenant");
    cy.get("form > .btn").should("have.class", "btn");
    cy.get(":nth-child(5) > a").should(
      "have.attr",
      "href",
      "#/passwordrecovery"
    );
    cy.get("a > .btn").should("have.class", "btn");
    cy.get("a > .btn").click();
    cy.get(".page-header > b").should("have.text", "tenants");
    cy.get(".nav-link").should("have.class", "nav-link");
    cy.get(":nth-child(1) > .col-sm-2 > b").should("have.text", "token");
    cy.get(":nth-child(2) > .col-sm-2 > b").should("have.text", "_id");
    cy.get(":nth-child(3) > .col-sm-2 > b").should("have.text", "organization");
    cy.get(":nth-child(4) > .col-sm-2 > b").should("have.text", "address");
    cy.get(":nth-child(5) > .col-sm-2 > b").should("have.text", "email");
    cy.get(":nth-child(6) > .col-sm-2 > b").should("have.text", "phone");
    cy.get(":nth-child(7) > .col-sm-2 > b").should(
      "have.text",
      "admin_username"
    );
    cy.get(":nth-child(8) > .col-sm-2 > b").should(
      "have.text",
      "admin_password"
    );
    cy.get(".btn-primary").should("have.class", "btn");
    cy.get(".btn-secondary").should("have.class", "btn");
    cy.get(".btn-secondary").click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get("#username").clear("ad");
    cy.get("#username").type("admin");
    cy.get("#formBasicPassword").clear();
    cy.get("#formBasicPassword").type("adminAdmin");
    cy.get("#tenant").clear();
    cy.get("#tenant").type("test-tenant");
    cy.get("form > .btn").click();
    cy.get("a > b").should("have.text", "admin");
    cy.get("h3 > .svg-inline--fa > path").should("be.visible");
    cy.get("h3 > b").should("have.text", "test-tenant");
    cy.get('[style="padding-left: 20px; padding-bottom: 20px;"] > .btn').should(
      "have.class",
      "btn-outline-danger"
    );
    cy.get('[href="#/users"]').should("have.text", "Users");
    cy.get('[href="#/roles"]').should("have.text", "Roles");
    cy.get('[href="#/tags"]').should("have.text", "Tags");
    cy.get('[href="#/things"]').should("have.text", "Things");
    cy.get('[href="#/features"]').should("have.text", "Features");
    cy.get('[href="#/devices"]').should("have.text", "Devices");
    cy.get('[href="#/protocols"]').should("have.text", "Protocols");
    cy.get('[href="#/experiments"]').should("have.text", "Experiments");
    cy.get('[href="#/measurements"]').should("have.text", "Measurements");
    cy.get('[href="#/updatehistory"]').should(
      "have.text",
      "Update Experiments History"
    );
    cy.get('[href="#/downloadexperiment"]').should(
      "have.text",
      "Download Experiments Data"
    );
    cy.get('[href="#/removesteps"]').should(
      "have.text",
      "Remove History Steps"
    );
    cy.get(".notificationBar > .btn").should("have.class", "btn");
    cy.get(".page-content").should("have.class", "page-content");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
    cy.get(".auth-page").should("have.class", "auth-page");
    /* ==== End Cypress Studio ==== */
  });
});
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
describe("create/validate and delete role", () => {
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
    cy.get("form > .btn-primary").should("have.class", "btn-primary");
    cy.get(".btn-secondary").should("have.class", "btn-secondary");
    cy.get(".element").should("have.text", "0");
    cy.get("form > .btn-primary").click();
    cy.get("tbody > :nth-child(5) > :nth-child(1)").should(
      "have.text",
      "test-role"
    );
    cy.get(
      ":nth-child(5) > :nth-child(2) > :nth-child(1) > .svg-inline--fa > path"
    ).click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(1) > .accordion-header > .accordion-button > b"
    ).should("have.text", "_id");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button > b"
    ).should("have.text", "default");
    cy.get(":nth-child(3) > :nth-child(1) > .accordion-button").should(
      "have.text",
      "actions"
    );
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(1) > .accordion-collapse > .accordion-body"
    ).should("have.text", "test-role");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-header > .accordion-button > b"
    ).click();
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(1) > b"
    ).should("have.text", "create");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(1) > b"
    ).should("have.text", "read");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(1) > b"
    ).should("have.text", "update");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(1) > b"
    ).should("have.text", "delete");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(2)"
    ).should("have.text", "false");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(2)"
    ).should("have.text", "none");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(2)"
    ).should("have.text", "none");
    cy.get(
      ".popover-body > :nth-child(1) > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(2)"
    ).should("have.text", "none");
    cy.get(":nth-child(3) > :nth-child(1) > .accordion-button").click();
    cy.get(
      '[style=""] > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(1) > .accordion-button'
    ).click();
    cy.get(
      ':nth-child(1) > [style=""] > :nth-child(1) > .accordion > :nth-child(1) > .accordion-collapse > .accordion-body'
    ).should("have.text", "tag");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-header > .accordion-button"
    ).click();
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(1) > b"
    ).should("have.text", "create");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(1) > b"
    ).should("have.text", "read");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(1) > b"
    ).should("have.text", "update");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(1) > b"
    ).should("have.text", "delete");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(1) > :nth-child(2)"
    ).should("have.text", "true");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(2) > :nth-child(2)"
    ).should("have.text", "all");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(3) > :nth-child(2)"
    ).should("have.text", "all");
    cy.get(
      ":nth-child(1) > .accordion > :nth-child(2) > .accordion-collapse > .accordion-body > .table-responsive > .table > tbody > :nth-child(4) > :nth-child(2)"
    ).should("have.text", "all");
    cy.get(".page-content").click();
    cy.get(".element").should("have.text", "1");
    cy.get(
      ":nth-child(5) > :nth-child(2) > :nth-child(2) > .svg-inline--fa"
    ).click();
    cy.get(".element").should("have.text", "2");
    cy.get(
      '[style="padding-left: 20px; padding-bottom: 20px;"] > .btn'
    ).click();
    /* ==== End Cypress Studio ==== */
  });
});
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
describe("create/validate and delete feature", () => {
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
  });
});
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
