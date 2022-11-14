process.env.ENV = "test";
process.env.LOG = "false";

// Import test tools
const chai = require("chai");
const chaiHttp = require("chai-http");
const database = require("../database.js");
const server = require("../server.js");
const mongoose = require("mongoose");
const should = chai.should();
const factory = require("../commons/factory.js");
const UserRoles = require("../types/userRoles.js");
const errors = require("../commons/errors.js");
const ItemTypes = require("../types/itemTypes.js");
chai.use(chaiHttp);
const before = require("./before-test.js");

// Test the /GET route
describe("/GET measurements", () => {
  it("it should not GET a fake measurement", async () => {
    const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
    const res = await chai.request(server).keepOpen().get("/v1/measurements/fake-measurement").set("Authorization", await factory.getUserToken(user));
    res.should.have.status(errors.resource_not_found.status);
    res.body.should.be.a("object");
    res.body.message.should.contain(errors.resource_not_found.message);
  });

  it("it should GET all the measurements", async () => {
    const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
    const feature = await factory.createFeature("test-feature", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [feature]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(1));
    const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(2));
    const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(3));
    const res = await chai.request(server).keepOpen().get("/v1/measurements").set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(3);
  });

  it("it should GET all the measurements as CSV", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature", owner, [
      { name: "item-name-1", unit: "items-unit-1", type: ItemTypes.number },
      { name: "item-name-2", unit: "items-unit-2", type: ItemTypes.number },
      { name: "item-name-3", unit: "items-unit-3", type: ItemTypes.number },
    ]);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      [
        factory.createSample([1.8, 5.3, 6.2]),
        factory.createSample([9.7, 2.1, 5.2]),
      ]
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples([4.4, 7.3, 3.6])
    );
    const res = await chai
      .request(server)
      .keepOpen()
      .get("/v1/measurements")
      .set("Authorization", await factory.getUserToken(owner))
      .set("Accept", "text/csv");
    res.should.have.status(200);
    res.text.should.be.a("string");
  });

  it("it should GET a specific measurement", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(1)
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(2)
    );
    const measurement3 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(3)
    );
    const res = await chai
      .request(server)
      .keepOpen()
      .get("/v1/measurements/" + measurement2._id)
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body._id.should.eql(measurement2._id.toString());
  });

  it("it should GET measurements paginated", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(1)
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(2)
    );
    const measurement3 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(3)
    );
    const measurement4 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(4)
    );
    const res = await chai
      .request(server)
      .keepOpen()
      .get("/v1/measurements?limit=2&page=1")
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(2);
    res.body.limit.should.be.eql(2);
    res.body.page.should.be.eql(1);
    res.body.totalPages.should.be.eql(2);
  });

  it("it should GET measurements only of a specific tag", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1],
      factory.createSamples(1)
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag2],
      factory.createSamples(2)
    );
    const measurement3 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1],
      factory.createSamples(3)
    );
    const measurement4 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(4)
    );
    const measurement5 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1],
      factory.createSamples(5)
    );
    let res = await chai
      .request(server)
      .keepOpen()
      .get('/v1/measurements?filter={"tags":"test-tag-1"}')
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(4);
    res = await chai
      .request(server)
      .keepOpen()
      .get('/v1/measurements?filter={"tags":"test-tag-2"}')
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(2);
  });

  it("it should GET the size of measurements only of a specific tag", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1],
      factory.createSamples(1)
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag2],
      factory.createSamples(2)
    );
    const measurement3 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1],
      factory.createSamples(3)
    );
    const measurement4 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(4)
    );
    const measurement5 = await factory.createMeasurement(
      owner,
      feature,
      device,
      thing,
      [tag1],
      factory.createSamples(5)
    );
    let res = await chai
      .request(server)
      .keepOpen()
      .get('/v1/measurements/count?filter={"tags":"test-tag-1"}')
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.size.should.be.eql(4);
  });

  it("it should GET measurements only of a specific tag AND a of a specific feature", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature1 = await factory.createFeature("test-feature-1", owner);
    const feature2 = await factory.createFeature("test-feature-2", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature1,
      feature2,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag1],
      factory.createSamples(1)
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag2],
      factory.createSamples(2)
    );
    const measurement3 = await factory.createMeasurement(
      owner,
      feature2,
      device,
      thing,
      [tag1],
      factory.createSamples(3)
    );
    const measurement4 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(4)
    );
    const measurement5 = await factory.createMeasurement(
      owner,
      feature2,
      device,
      thing,
      [tag2],
      factory.createSamples(5)
    );
    let res = await chai
      .request(server)
      .keepOpen()
      .get(
        '/v1/measurements?filter={"feature":"test-feature-1", "tags":"test-tag-1"}'
      )
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(2);
    res = await chai
      .request(server)
      .keepOpen()
      .get(
        '/v1/measurements?filter={"feature":"test-feature-1", "tags":"test-tag-2"}'
      )
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(2);
    res = await chai
      .request(server)
      .keepOpen()
      .get(
        '/v1/measurements?filter={"feature":"test-feature-2", "tags":"test-tag-2"}'
      )
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(1);
  });

  it("it should GET the size measurements only of a specific tag AND a of a specific feature", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature1 = await factory.createFeature("test-feature-1", owner);
    const feature2 = await factory.createFeature("test-feature-2", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature1,
      feature2,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag1],
      factory.createSamples(1)
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag2],
      factory.createSamples(2)
    );
    const measurement3 = await factory.createMeasurement(
      owner,
      feature2,
      device,
      thing,
      [tag1],
      factory.createSamples(3)
    );
    const measurement4 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(4)
    );
    const measurement5 = await factory.createMeasurement(
      owner,
      feature2,
      device,
      thing,
      [tag2],
      factory.createSamples(5)
    );
    let res = await chai
      .request(server)
      .keepOpen()
      .get(
        '/v1/measurements/count?filter={"feature":"test-feature-1", "tags":"test-tag-1"}'
      )
      .set("Authorization", await factory.getUserToken(owner));
    res.body.should.be.a("object");
    res.body.size.should.be.eql(2);
  });

  it("it should GET measurements only of a specific tag OR a of a specific feature", async () => {
    const owner = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature1 = await factory.createFeature("test-feature-1", owner);
    const feature2 = await factory.createFeature("test-feature-2", owner);
    const tag1 = await factory.createTag("test-tag-1", owner);
    const tag2 = await factory.createTag("test-tag-2", owner);
    const device = await factory.createDevice("test-device-1", owner, [
      feature1,
      feature2,
    ]);
    const thing = await factory.createThing("test-thing-1", owner);
    const measurement1 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag1],
      factory.createSamples(1)
    );
    const measurement2 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag2],
      factory.createSamples(2)
    );
    const measurement3 = await factory.createMeasurement(
      owner,
      feature2,
      device,
      thing,
      [tag1],
      factory.createSamples(3)
    );
    const measurement4 = await factory.createMeasurement(
      owner,
      feature1,
      device,
      thing,
      [tag1, tag2],
      factory.createSamples(4)
    );
    const measurement5 = await factory.createMeasurement(
      owner,
      feature2,
      device,
      thing,
      [tag1],
      factory.createSamples(5)
    );
    let res = await chai
      .request(server)
      .keepOpen()
      .get(
        '/v1/measurements?filter={"$or":[{"feature":"test-feature-1"}, {"tags":"test-tag-1"}]}'
      )
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(5);
    res = await chai
      .request(server)
      .keepOpen()
      .get(
        '/v1/measurements?filter={"$or":[{"feature":"test-feature-1"},{"tags":"test-tag-2"}]}'
      )
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(3);
    res = await chai
      .request(server)
      .keepOpen()
      .get(
        '/v1/measurements?filter={"$or":[{"feature":"test-feature-2"},{"tags":"test-tag-2"}]}'
      )
      .set("Authorization", await factory.getUserToken(owner));
    res.should.have.status(200);
    res.body.docs.should.be.a("array");
    res.body.docs.length.should.be.eql(4);
  });
});

// Test the /POST route
describe("/POST measurement", () => {
  it("it should not POST a measurement without thing field", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-1", user);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      feature: feature._id,
      device: device._id,
      samples: [
        { values: 10.4, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("Please, supply a thing");
  });

  it("it should not POST a measurement without device field", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-2", user);
    const device = await factory.createDevice("test-device-2", user, [feature]);
    const thing = await factory.createThing("test-thing-2", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      feature: feature._id,
      samples: [
        { values: 10.4, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("Please, supply a device");
  });

  it("it should not POST a measurement with a fake feature", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-1", user);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: "fake-feature",
      samples: [
        { values: 10.7, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("Feature not existent");
  });

  it("it should not POST a measurement with a fake device", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-1", user);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: "fake-device",
      feature: feature._id,
      samples: [
        { values: 10.4, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("Device not existent");
  });

  it("it should not POST a measurement with a fake thing", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-1", user);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: "fake-thing",
      device: device._id,
      feature: feature._id,
      samples: [
        { values: 10.4, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("Thing not existent");
  });

  it("it should not POST a measurement with samples not coherent with the feature", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-1", user);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: [10.4, 34.2], delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain(
      "No match between sample values size and feature items size"
    );
  });

  it("it should not POST a measurement with numeric samples with text feature", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.admin
    );
    const items = [
      { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.text },
    ];
    const feature = await factory.createFeature("test-feature-3", user, items);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: 10.4, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain(
      "No match between sample value type and feature items type"
    );
  });

  it("it should not POST a measurement with a enum samples with value out of feature range", async () => {
    const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin );
    const items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.enum, range: ["A", "B"] }];
    const feature = await factory.createFeature("test-feature-3", user, items);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: { type: "Point", coordinates: [12.123456, 13.1345678]},
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [ { values: "A", delta: 200 },
                 { values: "C", delta: 220 }
      ],
    };
    const res = await chai.request(server).keepOpen().post("/v1/measurements").set("Authorization", await factory.getUserToken(user)).send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("No match between sample value type and feature items type");
  });

  it("it should not POST a measurement with textual samples with a numeric feature", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.admin
    );
    const items = [
      { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.number },
    ];
    const feature = await factory.createFeature("test-feature-3", user, items);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: "text-test-1", delta: 200 },
        { values: "text-test-2", delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain(
      "No match between sample value type and feature items type"
    );
  });

  it("it should not POST a measurement with a feature not available for the device", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const measurement_feature = await factory.createFeature(
      "test-feature-1",
      user
    );
    const device_feature = await factory.createFeature("test-feature-2", user);
    const device = await factory.createDevice("test-device-1", user, [
      device_feature,
    ]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: measurement_feature._id,
      samples: [{ values: 10.4, delta: 200 }],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain(
      "No match between device features and measurement feature"
    );
  });

  /*
  it("it should not POST a measurement with a empty", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-1", user);
    const device = await factory.createDevice("test-device-1", user, [feature]);
    const thing = await factory.createThing("test-thing-1", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("No samples specified for this measurement");
  });
  */

  it("it should POST a measurement with samples of several items", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const items = [
      { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.number },
      { name: "item-name-2", unit: "item-unit-2", type: ItemTypes.number },
      { name: "item-name-3", unit: "item-unit-3", type: ItemTypes.number },
      { name: "item-name-4", unit: "item-unit-4", type: ItemTypes.number },
    ];
    const feature = await factory.createFeature("test-feature-3", user, items);
    const device = await factory.createDevice("test-device-3", user, [feature]);
    const thing = await factory.createThing("test-thing-3", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: [10.4, 11, 54, 12], delta: 200 },
        { values: [10.5, 43, 23, 10], delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("_id");
    res.body.should.have.property("startDate");
    res.body.should.have.property("thing");
    res.body.should.have.property("feature");
    res.body.should.have.property("device");
    res.body.should.have.property("timestamp");
    res.body.should.have.property("samples");
    res.body.thing.should.be.eql(measurement.thing);
    res.body.feature.should.be.eql(measurement.feature);
    res.body.device.should.be.eql(measurement.device);
  });

  it("it should POST a measurement with a enum item", async () => {
    const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
    const items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.enum, range: ["A", "B"] } ];
    const feature = await factory.createFeature("test-feature-3", user, items);
    const device = await factory.createDevice("test-device-3", user, [feature]);
    const thing = await factory.createThing("test-thing-3", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: { type: "Point", coordinates: [12.123456, 13.1345678], },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [ { values: "A", delta: 200 },
                 { values: "B", delta: 200 } ],
    };
    const res = await chai.request(server).keepOpen().post("/v1/measurements").set("Authorization", await factory.getUserToken(user)).send(measurement);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("_id");
    res.body.should.have.property("startDate");
    res.body.should.have.property("thing");
    res.body.should.have.property("feature");
    res.body.should.have.property("device");
    res.body.should.have.property("timestamp");
    res.body.should.have.property("samples");
    res.body.thing.should.be.eql(measurement.thing);
    res.body.feature.should.be.eql(measurement.feature);
    res.body.device.should.be.eql(measurement.device);
  });

  it("it should POST a measurement removing empty samples", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const items = [
      { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.number },
      { name: "item-name-2", unit: "item-unit-2", type: ItemTypes.number },
      { name: "item-name-3", unit: "item-unit-3", type: ItemTypes.number },
      { name: "item-name-4", unit: "item-unit-4", type: ItemTypes.number },
    ];
    const feature = await factory.createFeature("test-feature-3", user, items);
    const device = await factory.createDevice("test-device-3", user, [feature]);
    const thing = await factory.createThing("test-thing-3", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: [10.4, 11, 54, 12], delta: 200 },
        {},
        { values: [10.5, 43, 23, 10], delta: 220 },
        { values: [] },
        {},
        { values: [10.6, 23, 12, 10], delta: 260 },
        { values: [10.6, 23, 12, 10], delta: 260 },
      ],
    };
    const res = await chai.request(server).keepOpen().post("/v1/measurements").set("Authorization", await factory.getUserToken(user)).send(measurement);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("_id");
    res.body.should.have.property("samples");
    res.body.samples.length.should.be.eql(4);
  });

  it("it should POST a measurement with sample of one item", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-3", user, [
      { name: "item-name-1", unit: "item-unit-1" },
    ]);
    const device = await factory.createDevice("test-device-3", user, [feature]);
    const thing = await factory.createThing("test-thing-3", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: 10.4, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("_id");
    res.body.should.have.property("startDate");
    res.body.should.have.property("thing");
    res.body.should.have.property("feature");
    res.body.should.have.property("device");
    res.body.should.have.property("timestamp");
    res.body.should.have.property("samples");
    res.body.thing.should.be.eql(measurement.thing);
    res.body.feature.should.be.eql(measurement.feature);
    res.body.device.should.be.eql(measurement.device);
  });

  it("it should POST a measurement also with tags", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const tag = await factory.createTag("test-tag-1", user);
    const feature = await factory.createFeature("test-feature-4", user);
    const device = await factory.createDevice("test-device-4", user, [feature]);
    const thing = await factory.createThing("test-thing-4", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: 10.6, delta: 200 },
        { values: 10.5, delta: 220 },
      ],
      tags: [tag._id],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("_id");
    res.body.should.have.property("startDate");
    res.body.should.have.property("thing");
    res.body.should.have.property("feature");
    res.body.should.have.property("device");
    res.body.should.have.property("timestamp");
    res.body.thing.should.be.eql(measurement.thing);
    res.body.feature.should.be.eql(measurement.feature);
    res.body.tags[0].should.be.eql(measurement.tags[0]);
    res.body.device.should.be.eql(measurement.device);
  });

  it("it should not POST a measurement with a fake tag", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const tag = await factory.createTag("test-tag-2", user);
    const feature = await factory.createFeature("test-feature-5", user);
    const device = await factory.createDevice("test-device-5", user, [feature]);
    const thing = await factory.createThing("test-thing-5", user);
    const measurement = {
      owner: user,
      startDate: new Date().toISOString,
      endDate: new Date().toISOString,
      position: {
        type: "Point",
        coordinates: [12.123456, 13.1345678],
      },
      thing: thing._id,
      device: device._id,
      feature: feature._id,
      samples: [
        { values: [10.4], delta: 200 },
        { values: [10.5], delta: 220 },
      ],
      tags: [tag, "fake-tag"],
    };
    const res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurement);
    res.should.have.status(errors.post_request_error.status);
    res.body.should.be.a("object");
    res.body.message.should.be.a("string");
    res.should.have.status(errors.post_request_error.status);
    res.body.message.should.contain(errors.post_request_error.message);
    res.body.details.should.contain("Tag not existent");
  });

  /*
    it('it should POST in a idempotent way', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-6", user);
        const device = await factory.createDevice("test-device-6", user, [feature]);
        const thing = await factory.createThing("test-thing-6", user);
        const startdate = new Date().toISOString();
        const enddate = new Date().toISOString();
        const measurement = {
            owner: user,
            startDate: startdate,
            endDate: enddate,
            position: {
                type: "Point",
                coordinates: [12.123456, 13.1345678]
            },
            thing: thing._id,
            device: device._id,
            feature: feature._id,
            samples: [
                { values: [10.4], delta: 200 },
                { values: [10.5], delta: 220 }
            ]
        }
        let res = await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", await factory.getUserToken(user)).send(measurement);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res = await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", await factory.getUserToken(user)).send(measurement)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('The measurement already exists');
    });
*/
  it("it should POST a list of measurements", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-7", user);
    const device = await factory.createDevice("test-device-7", user, [feature]);
    const thing = await factory.createThing("test-thing-7", user);
    const measurements = [
      {
        owner: user,
        startDate: new Date().toISOString,
        endDate: new Date().toISOString,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: thing._id,
        device: device._id,
        feature: feature._id,
        samples: [
          { values: [10.4], delta: 200 },
          { values: [10.5], delta: 220 },
        ],
      },
      {
        owner: user,
        startDate: new Date().toISOString,
        endDate: new Date().toISOString,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: thing._id,
        device: device._id,
        feature: feature._id,
        samples: [
          { values: [11.4], delta: 200 },
          { values: [10.5], delta: 220 },
        ],
      },
    ];
    const measurements2 = [
      {
        owner: user,
        startDate: new Date().toISOString,
        endDate: new Date().toISOString,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: thing._id,
        device: device._id,
        feature: feature._id,
        samples: [
          { values: [13.4], delta: 200 },
          { values: [13.5], delta: 220 },
        ],
      },
      {
        owner: user,
        startDate: new Date().toISOString,
        endDate: new Date().toISOString,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: thing._id,
        device: device._id,
        feature: feature._id,
        samples: [
          { values: [14.4], delta: 200 },
          { values: [14.5], delta: 220 },
        ],
      },
    ];
    let res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements?verbose=false")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurements);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.saved.should.be.eql(2);
    res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurements2);
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.measurements[0].thing.should.be.eql("test-thing-7");
    res.body.measurements[1].thing.should.be.eql("test-thing-7");
  });

  it("it should POST only correct measurements from a list", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature-8", user);
    const device = await factory.createDevice("test-device-8", user, [feature]);
    const thing1 = await factory.createThing("test-thing-8", user);
    const thing2 = await factory.createThing("test-thing-9", user);
    const startdate = new Date().toISOString();
    const enddate = new Date().toISOString();
    const measurements = [
      {
        owner: user,
        startDate: startdate,
        endDate: enddate,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: "fake_thing",
        device: device._id,
        feature: feature._id,
        samples: [
          { values: [10.4], delta: 200 },
          { values: [10.5], delta: 220 },
        ],
      },
      {
        owner: user,
        startDate: startdate,
        endDate: enddate,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: thing1._id,
        device: device._id,
        feature: feature._id,
        samples: [
          { values: [10.4], delta: 200 },
          { values: [10.5], delta: 220 },
        ],
      },
      {
        owner: user,
        startDate: startdate,
        endDate: enddate,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: thing2._id,
        device: device._id,
        feature: "fake-feature",
        samples: [
          { values: [10.4], delta: 200 },
          { values: [10.5], delta: 220 },
        ],
      },
      {
        owner: user,
        startDate: startdate,
        endDate: enddate,
        position: {
          type: "Point",
          coordinates: [12.123456, 13.1345678],
        },
        thing: thing2._id,
        device: "fake-device",
        feature: feature._id,
        samples: [
          { values: [10.4], delta: 200 },
          { values: [10.5], delta: 220 },
        ],
      },
    ];
    let res = await chai
      .request(server)
      .keepOpen()
      .post("/v1/measurements?verbose=false")
      .set("Authorization", await factory.getUserToken(user))
      .send(measurements);
    res.should.have.status(202);
    res.body.should.be.a("object");
    res.body.saved.should.be.eql(1);
    res.body.errors.should.be.eql(3);
  });
});

// Test the /DELETE route
describe("/DELETE measurement", () => {
  it("it should DELETE a measurement", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature", user);
    const device = await factory.createDevice("test-device-4", user, [feature]);
    const tag = await factory.createTag("test-tag", user);
    const thing = await factory.createThing("test-thing", user);
    const measurement = await factory.createMeasurement(
      user,
      feature,
      device,
      thing,
      [tag]
    );
    const measurements_before = await before.Measurement.find();
    measurements_before.length.should.be.eql(1);
    const res = await chai
      .request(server)
      .keepOpen()
      .delete("/v1/measurements/" + measurement._id)
      .set("Authorization", await factory.getUserToken(user));
    res.should.have.status(200);
    res.body.should.be.a("object");
    const measurements_after = await before.Measurement.find();
    measurements_after.length.should.be.eql(0);
  });

  it("it should not DELETE a fake measurement", async () => {
    const user = await factory.createUser(
      "test-username-1",
      "test-password-1",
      UserRoles.provider
    );
    const feature = await factory.createFeature("test-feature", user);
    const device = await factory.createDevice("test-device-4", user, [feature]);
    const tag = await factory.createTag("test-tag", user);
    const thing = await factory.createThing("test-thing", user);
    const measurement = await factory.createMeasurement(
      user,
      feature,
      device,
      thing,
      [tag]
    );
    const measurements_before = await before.Measurement.find();
    measurements_before.length.should.be.eql(1);
    const res = await chai
      .request(server)
      .keepOpen()
      .delete("/v1/measurements/fake_measurement")
      .set("Authorization", await factory.getUserToken(user));
    res.should.have.status(errors.resource_not_found.status);
    res.body.should.be.a("object");
    res.body.message.should.contain(errors.resource_not_found.message);
    const measurements_after = await before.Measurement.find();
    measurements_after.length.should.be.eql(1);
  });
});

/*
// Test the stream route
describe('/STREAM measurement', () => {
    it('it should stream a list of measurements', async () => {
        const WebSocket = require('ws');
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-7", user);
        const device = await factory.createDevice("test-device-7", user, [feature]);
        const thing = await factory.createThing("test-thing-7", user);
        const measurements = [
            {
                startDate: new Date().toISOString,
                endDate: new Date().toISOString,
                position: {
                    type: "Point",
                    coordinates: [12.123456, 13.1345678]
                },
                thing: thing._id,
                device: device._id,
                feature: feature._id,
                samples: [
                    { values: [10.4], delta: 200 },
                    { values: [10.5], delta: 220 }
                ]
            },
            {
                startDate: new Date().toISOString,
                endDate: new Date().toISOString,
                position: {
                    type: "Point",
                    coordinates: [12.123456, 13.1345678]
                },
                thing: thing._id,
                device: device._id,
                feature: feature._id,
                samples: [
                    { values: [10.4], delta: 200 },
                    { values: [10.5], delta: 220 }
                ]
            }
        ];
        const token = await factory.getUserToken(user);
        const url = "wss://127.0.0.1:443/v1/streams?&token=" + token;
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('object');
            message.measurements[0].thing.should.be.eql("test-thing-7");
            message.measurements[1].thing.should.be.eql("test-thing-7");
            client.close();
        });
        client.on('error', function error(message) { assert.fail(message) });
        client.on('open',  function open() { client.send("ciao"); });
        await new Promise(done => { client.on('close', done) });
    }); 
});
*/

// Test the /POST file csv route
describe('/POST file CSV route', () => {
  it('it should POST measurements from correct one row CSV', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file1.txt';
      const testDescription = './test/test/test-description.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(200);

      res.body.should.be.a('object');
      res.body.should.have.property('completed');
      res.body.should.have.property('errors');
      res.body.completed.length.should.be.eql(1);
      res.body.errors.length.should.be.eql(0);        
  });

  it('it should POST measurements from CSV some row correct and some not', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file2.txt';
      const testDescription = './test/test/test-description.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(202);
      res.body.should.be.a('object');
      res.body.should.have.property('completed');
      res.body.should.have.property('errors');
      res.body.completed.length.should.be.eql(2);
      res.body.errors.length.should.be.eql(7);
      res.body.completed[0].should.be.eql('1');
      res.body.completed[1].should.be.eql('8');
      res.body.errors[0].should.be.eql('Index: 2 (thing fake-thing not found in database)');
      res.body.errors[1].should.be.eql('Index: 3 (device fake-device not found in database)');
      res.body.errors[2].should.be.eql('Index: 4 (Mismatch number of elements: Expected 6, got 5)');
      res.body.errors[3].should.be.eql('Index: 5 (startdate is not in Date format)');
      res.body.errors[4].should.be.eql('Index: 6 (tag fake-tag not found in database)'); 
      res.body.errors[5].should.be.eql('Index: 7 (enddate is not in Date format)');
      res.body.errors[6].should.be.eql('Index: 9 (expected number in samples at position 0)');       
  });

  it('it should POST measurements from CSV with force = true and the object not found in database will be created', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file2.txt';
      const testDescription = './test/test/test-description.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(202);
      res.body.should.be.a('object');
      res.body.should.have.property('completed');
      res.body.should.have.property('errors');
      res.body.completed.length.should.be.eql(5);
      res.body.errors.length.should.be.eql(4);
      res.body.completed[0].should.be.eql('1');
      res.body.completed[1].should.be.eql('2');
      res.body.completed[2].should.be.eql('3');
      res.body.completed[3].should.be.eql('6');
      res.body.completed[4].should.be.eql('8');
      res.body.errors[0].should.be.eql('Index: 4 (Mismatch number of elements: Expected 6, got 5)');
      res.body.errors[1].should.be.eql('Index: 5 (startdate is not in Date format)');        
      res.body.errors[2].should.be.eql('Index: 7 (enddate is not in Date format)');
      res.body.errors[3].should.be.eql('Index: 9 (expected number in samples at position 0)');       
  });
  
  it('it should not POST measurements with a wrong description file', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file2.txt';
      const testDescription = './test/test/test-fake-description.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(errors.description_not_json.status);
      res.body.should.be.a('object');
      res.body.message.should.be.a('string');        
      res.body.message.should.contain(errors.description_not_json.message);       
  });

  //with multiple features
  it('it should POST measurements from correct one row CSV with multiple features', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file1-multiple-features.txt';
      const testDescription = './test/test/test-description-multiple-features.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('completed');
      res.body.should.have.property('errors');
      res.body.completed.length.should.be.eql(1);
      res.body.errors.length.should.be.eql(0);        
  });

  it('it should POST measurements from CSV with multiple features some row correct and some not', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file2-multiple-features.txt';
      const testDescription = './test/test/test-description-multiple-features.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(202);
      res.body.should.be.a('object');
      res.body.should.have.property('completed');
      res.body.should.have.property('errors');
      res.body.completed.length.should.be.eql(1);
      res.body.errors.length.should.be.eql(8);
      res.body.completed[0].should.be.eql('1');
      res.body.errors[0].should.be.eql('Index: 2 (thing fake-thing not found in database)');
      res.body.errors[1].should.be.eql('Index: 3 (device fake-device not found in database)');
      res.body.errors[2].should.be.eql('Index: 4 (Mismatch number of elements: Expected 7, got 6)');
      res.body.errors[3].should.be.eql('Index: 5 (startdate is not in Date format)');
      res.body.errors[4].should.be.eql('Index: 6 (tag fake-tag not found in database)'); 
      res.body.errors[5].should.be.eql('Index: 7 (enddate is not in Date format)');
      res.body.errors[6].should.be.eql('Index: 8 (feature bad-feature not found in database)');
      res.body.errors[7].should.be.eql('Index: 9 (expected number in samples at position 0)');       
  });

  it('it should POST measurements from CSV with multiple features with force = true and the object not found in database will be created', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file2-multiple-features.txt';
      const testDescription = './test/test/test-description-multiple-features.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(202);
      res.body.should.be.a('object');
      res.body.should.have.property('completed');
      res.body.should.have.property('errors');
      res.body.completed.length.should.be.eql(4);
      res.body.errors.length.should.be.eql(5);
      res.body.completed[0].should.be.eql('1');
      res.body.completed[1].should.be.eql('2');
      res.body.completed[2].should.be.eql('3');
      res.body.completed[3].should.be.eql('6');
      res.body.errors[0].should.be.eql('Index: 4 (Mismatch number of elements: Expected 7, got 6)');
      res.body.errors[1].should.be.eql('Index: 5 (startdate is not in Date format)');        
      res.body.errors[2].should.be.eql('Index: 7 (enddate is not in Date format)');
      res.body.errors[3].should.be.eql('Index: 8 (feature bad-feature not found in database)');
      res.body.errors[4].should.be.eql('Index: 9 (expected number in samples at position 0)');       
  });

  it('it should POST measurements from CSV with multiple features with force = true and header = false', async () => {
    const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
    const tag1 = await factory.createTag("test-tag-1", user);
    const tag2 = await factory.createTag("test-tag-2", user);
    const feature = await factory.createFeature("test-feature", user);
    const device1 = await factory.createDevice("test-device-1", user, [feature]);
    const device2 = await factory.createDevice("test-device-2", user, [feature]);
    const thing1 = await factory.createThing("test-thing-1", user);
    const testFile = './test/test/test-file2-multiple-features-no-header.txt';
    const testDescription = './test/test/test-description-multiple-features.txt';
    
    const res = await chai.request(server).keepOpen().post('/v1/measurements/file?force=true&header=false').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
    res.should.have.status(202);
    res.body.should.be.a('object');
    res.body.should.have.property('completed');
    res.body.should.have.property('errors');
    res.body.completed.length.should.be.eql(4);
    res.body.errors.length.should.be.eql(5);
    res.body.completed[0].should.be.eql('0');
    res.body.completed[1].should.be.eql('1');
    res.body.completed[2].should.be.eql('2');
    res.body.completed[3].should.be.eql('5');
    res.body.errors[0].should.be.eql('Index: 3 (Mismatch number of elements: Expected 7, got 6)');
    res.body.errors[1].should.be.eql('Index: 4 (startdate is not in Date format)');        
    res.body.errors[2].should.be.eql('Index: 6 (enddate is not in Date format)');
    res.body.errors[3].should.be.eql('Index: 7 (feature bad-feature not found in database)');
    res.body.errors[4].should.be.eql('Index: 8 (expected number in samples at position 0)');       
});
  
  it('it should not POST measurements with a wrong description file with multiple features', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
      const tag1 = await factory.createTag("test-tag-1", user);
      const tag2 = await factory.createTag("test-tag-2", user);
      const feature = await factory.createFeature("test-feature", user);
      const device1 = await factory.createDevice("test-device-1", user, [feature]);
      const device2 = await factory.createDevice("test-device-2", user, [feature]);
      const thing1 = await factory.createThing("test-thing-1", user);
      const testFile = './test/test/test-file2-multiple-features.txt';
      const testDescription = './test/test/test-fake-description.txt';
      
      const res = await chai.request(server).keepOpen().post('/v1/measurements/file?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
      res.should.have.status(errors.description_not_json.status);
      res.body.should.be.a('object');
      res.body.message.should.be.a('string');        
      res.body.message.should.contain(errors.description_not_json.message);       
  });
});