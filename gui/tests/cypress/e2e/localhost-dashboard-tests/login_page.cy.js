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
