process.env.ENV = "test";
process.env.LOG = "false";

// Import test tools
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server.js");
const mongoose = require("mongoose");
const should = chai.should();
const factory = require("../commons/factory.js");
const UserRoles = require("../types/userRoles.js");
const errors = require("../commons/errors.js");
const ItemTypes = require("../types/itemTypes.js");
chai.use(chaiHttp);
const before = require("./before-test.js");
const VisibilityTypes = require('../types/visibilityTypes.js'); 

// Test the /GET route
describe("/GET measurements", () => {    
    it("it should NOT GET measurements with a device token", async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature1 = await factory.createFeature("test-feature-1", owner);
        const feature2 = await factory.createFeature("test-feature-2", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature1, feature2,]);
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
        let res = await chai.request(server).keepOpen().get('/v1/measurements?filter={"$or":[{"feature":"test-feature-1"}, {"tags":"test-tag-1"}]}').set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.docs.should.be.a("array");
        res.body.docs.length.should.be.eql(0);
    });
});

// Test the /POST route with the device token
describe("/POST measurement", () => {
    it("it should not POST a measurement without thing field", async () => {
        const user = await factory.createUser(
            "test-username-1",
            "test-password-1",
            UserRoles.provider
        );
        const feature = await factory.createFeature("test-feature-1", user);
        const thing = await factory.createThing("test-thing-2", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurement);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain('The body of the request has not the field thing');
    });

    it("it should not POST a measurement without device field", async () => {
        const user = await factory.createUser(
            "test-username-1",
            "test-password-1",
            UserRoles.provider
        );
        const feature = await factory.createFeature("test-feature-2", user);
        const thing = await factory.createThing("test-thing-2", user);
        const device = await factory.createDevice("test-device-2", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurement);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain('The feature fake-feature is not in the acceptable features of the device');
    });

    it("it should not POST a measurement with a fake device", async () => {
        const user = await factory.createUser(
            "test-username-1",
            "test-password-1",
            UserRoles.provider
        );
        const feature = await factory.createFeature("test-feature-1", user);
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurement);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain('The thing fake-thing is not in the acceptable things of the device');
    });

    it("it should not POST a measurement with samples not coherent with the feature", async () => {
        const user = await factory.createUser(
            "test-username-1",
            "test-password-1",
            UserRoles.provider
        );
        const feature = await factory.createFeature("test-feature-1", user);
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const items = [{ name: "item-name-1", unit: "item-unit-1", type: ItemTypes.enum, range: ["A", "B"] }];
        const feature = await factory.createFeature("test-feature-3", user, items);
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
        const measurement = {
            owner: user,
            startDate: new Date().toISOString,
            endDate: new Date().toISOString,
            position: { type: "Point", coordinates: [12.123456, 13.1345678] },
            thing: thing._id,
            device: device._id,
            feature: feature._id,
            samples: [{ values: "A", delta: 200 },
            { values: "C", delta: 220 }
            ],
        };
        const res = await chai.request(server).keepOpen().post("/v1/measurements").set("Authorization", await factory.getDeviceToken(device)).send(measurement);
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
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        const thing = await factory.createThing("test-thing-1", user);
        const device = await factory.createDevice("test-device-1", user, [
            device_feature], [], null, null, null, [thing]
        );
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
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurement);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain('The feature test-feature-1 is not in the acceptable features of the device');
    });

    it("it should POST a measurement with samples of several items and get it", async () => {
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
        const thing = await factory.createThing("test-thing-3", user);
        const device = await factory.createDevice("test-device-3", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        //Get
        let res2 = await chai.request(server).keepOpen().get('/v1/measurements/' + res.body._id).set("Authorization", await factory.getDeviceToken(device));
        res2.should.have.status(200);
        res2.body.should.have.property("_id");
        res2.body._id.should.be.eql(res.body._id);
        res2.body.should.have.property("startDate");
        res2.body.should.have.property("thing");
        res2.body.should.have.property("feature");
        res2.body.should.have.property("device");
        res2.body.should.have.property("samples");
        res2.body.thing.should.be.eql(measurement.thing);
        res2.body.feature.should.be.eql(measurement.feature);
        res2.body.device.should.be.eql(measurement.device);
    });

    it("it should POST a measurement with a enum item", async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const items = [{ name: "item-name-1", unit: "item-unit-1", type: ItemTypes.enum, range: ["A", "B"] }];
        const feature = await factory.createFeature("test-feature-3", user, items);
        const thing = await factory.createThing("test-thing-3", user);
        const device = await factory.createDevice("test-device-3", user, [feature], [], null, null, null, [thing]);
        const measurement = {
            owner: user,
            startDate: new Date().toISOString,
            endDate: new Date().toISOString,
            position: { type: "Point", coordinates: [12.123456, 13.1345678], },
            thing: thing._id,
            device: device._id,
            feature: feature._id,
            samples: [{ values: "A", delta: 200 },
            { values: "B", delta: 200 }],
        };
        const res = await chai.request(server).keepOpen().post("/v1/measurements").set("Authorization", await factory.getDeviceToken(device)).send(measurement);
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
        const thing = await factory.createThing("test-thing-3", user);
        const device = await factory.createDevice("test-device-3", user, [feature], [], null, null, null, [thing]);
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
        const res = await chai.request(server).keepOpen().post("/v1/measurements").set("Authorization", await factory.getDeviceToken(device)).send(measurement);
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
        const thing = await factory.createThing("test-thing-3", user);
        const device = await factory.createDevice("test-device-3", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        const thing = await factory.createThing("test-thing-4", user);
        const device = await factory.createDevice("test-device-4", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
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
        const thing = await factory.createThing("test-thing-5", user);
        const device = await factory.createDevice("test-device-5", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurement);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a("object");
        res.body.message.should.be.a("string");
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Tag not existent");
    });

    it("it should POST a list of measurements", async () => {
        const user = await factory.createUser(
            "test-username-1",
            "test-password-1",
            UserRoles.provider
        );
        const feature = await factory.createFeature("test-feature-7", user);
        const thing = await factory.createThing("test-thing-7", user);
        const device = await factory.createDevice("test-device-7", user, [feature], [], null, null, null, [thing]);
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
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurements);
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.saved.should.be.eql(2);
        res = await chai
            .request(server)
            .keepOpen()
            .post("/v1/measurements")
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurements2);
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.measurements[0].thing.should.be.eql("test-thing-7");
        res.body.measurements[1].thing.should.be.eql("test-thing-7");
    });

    it("it should POST a list with not correct measurements", async () => {
        const user = await factory.createUser(
            "test-username-1",
            "test-password-1",
            UserRoles.provider
        );
        const feature = await factory.createFeature("test-feature-8", user);
        const thing1 = await factory.createThing("test-thing-8", user);
        const thing2 = await factory.createThing("test-thing-9", user);
        const device = await factory.createDevice("test-device-8", user, [feature], [], null, null, null, [thing1, thing2]);
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
            .set("Authorization", await factory.getDeviceToken(device))
            .send(measurements);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain('The feature fake-feature is not in the acceptable features of the device');
    });
});

// Test the /GET route
describe('/GET tags', () => {
    it('it should GET all the tags with device token', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user);
        await factory.createTag("test-tag-1", user);
        await factory.createTag("test-tag-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/tags').set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific tag with device token', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user);
        const tag = await factory.createTag("test-tag", user);
        const res = await chai.request(server).keepOpen().get('/v1/tags/' + tag._id).set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(tag._id.toString());
    });
});

// Test the /POST route
describe('/POST tag', () => {
    it('it should POST a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getDeviceToken(device)).send(tag)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        res.body._id.should.be.eql(tag._id);
    });
});

// Test the /DELETE route
describe('/DELETE tag', () => {
    it('it should not DELETE a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user);
        const tag = await factory.createTag("test-tag-2", user);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/'+tag._id).set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain("Device cannot do delete operation on the resource Tag");
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT tag', () => {
    it('it should not PUT a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { visibility: "public" };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getDeviceToken(device)).send(request);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain("Device cannot do put operation on the resource Tag");
    });
});

// Test the /GET route
describe('/GET device', () => {
    it('it should NOT GET all the devices', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-3", user);
        await factory.createDevice("test-device-1", user);
        await factory.createDevice("test-device-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/devices').set("Authorization", await factory.getDeviceToken(device));        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.docs.length.should.be.eql(0);
    });

    it('it should GET itself and not the others', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-3", user);
        const device2 = await factory.createDevice("test-device-1", user);        
        const res = await chai.request(server).keepOpen().get('/v1/devices/' + device._id).set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(device._id.toString());

        const res2 = await chai.request(server).keepOpen().get('/v1/devices/' + device2._id).set("Authorization", await factory.getDeviceToken(device));
        res2.should.have.status(errors.restricted_access_operation.status);
        res2.body.should.be.a('object');
        res2.body.message.should.contain(errors.restricted_access_operation.message);
        res2.body.details.should.contain("A Device cannot get information of other devices");
    });
});

// Test the /GET route
describe('/GET thing', () => {
    it('it should NOT GET all the things', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-3", user);
        await factory.createThing("test-thing-1", user, [], null, [], null, null);
        await factory.createThing("test-thing-2", user, [], null, [], null, null);
        const res = await chai.request(server).keepOpen().get('/v1/things').set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(0);
    });

    it('it should GET a specific thing in the device things list and not the other', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-2", user, [], null, []);
        const thing2 = await factory.createThing("test-thing-3", user, [], null, []);
        const device = await factory.createDevice("test-device-3", user,[],[],null,null,null,[thing]);
        
        const res = await chai.request(server).keepOpen().get('/v1/things/' + thing._id).set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());

        const res2 = await chai.request(server).keepOpen().get('/v1/things/' + thing2._id).set("Authorization", await factory.getDeviceToken(device));
        res2.should.have.status(errors.restricted_access_operation.status);
        res2.body.should.be.a('object');
        res2.body.message.should.contain(errors.restricted_access_operation.message);
        res2.body.details.should.contain("The Thing required is not in the list of acceptable things of the device");
    });
});

// Test the /GET route
describe('/GET feature', () => {
    it('it should NOT GET all the features', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-3", user);
        await factory.createFeature("test-feature-1", user);
        await factory.createFeature("test-feature-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/features').set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(0);
    });

    it('it should GET a specific feature', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);        
        const feature = await factory.createFeature("test-feature", user);
        const feature2 = await factory.createFeature("test-feature2", user);
        const device = await factory.createDevice("test-device-3", user,[feature]);
        const res = await chai.request(server).keepOpen().get('/v1/features/' + feature._id).set("Authorization", await factory.getDeviceToken(device));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature._id.toString());
        const res2 = await chai.request(server).keepOpen().get('/v1/features/' + feature2._id).set("Authorization", await factory.getDeviceToken(device));
        res2.should.have.status(errors.restricted_access_operation.status);
        res2.body.should.be.a('object');
        res2.body.message.should.contain(errors.restricted_access_operation.message);
        res2.body.details.should.contain("The Feature required is not in the list of acceptable features of the device");
    });
});

// Test the /POST route
describe('/POST time samples', () => {
    it('it should not POST a timesample without timestamp field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);       
        const thing = await factory.createThing("test-thing-1", owner); 
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [1] }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).send(timesample)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: timestamp');
    });

    it('it should not POST a timesample without values field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { timestamp: Date.now() }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).send(timesample)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: values');
    });

    it('it should POST a timesample', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [1], timestamp: Date.now() }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).send(timesample)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('values');
    });

    it('it should POST a list of timesamples', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = { values: [1], timestamp: Date.now() };
        const timesample02 = { values: [1], timestamp: Date.now() };
        const timesample03 = { values: [1], timestamp: Date.now() };
        const timesample04 = { values: [1], timestamp: Date.now() };
        const timesamples = [timesample01, timesample02, timesample03, timesample04];
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).send(timesamples)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(4);
    });

    it('it should POST a list of timesamples in csv from body', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const body= {
            body: "timestamp,values\n2022-12-21T14:15:27.976Z,[10]\n2022-12-22T14:15:27.976Z,[20]\n2022-12-23T14:15:27.976Z,[30]\n2022-12-24T14:15:27.976Z,[40]\n2022-12-25T14:15:27.976Z,[50]"    
        }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).set("Accept", "text/csv").send(body);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(5);
        const body2= {
            body: "timestamp,values\n2022-12-26T14:15:27.976Z,30\n2022-12-27T14:15:27.976Z,40\n2022-12-28T14:15:27.976Z,50\n2022-12-29T14:15:27.976Z,60\n2022-12-30T14:15:27.976Z,70"    
        }
        const res2 = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).set("Accept", "text/csv").send(body2);
        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body.timesamples.length.should.be.eql(5);
        const res3 = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device));
        res3.should.have.status(200);
        res3.body.docs.should.be.a('array');
        res3.body.docs.length.should.be.eql(10);
    });

    it('it should POST only correct timesamples of a list', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = { values: [1], timestamp: Date.now() };
        const timesample02 = { timestamp: Date.now() };
        const timesample03 = { values: [1], timestamp: Date.now() };
        const timesample04 = { values: [1], };
        const timesample05 = { values: [1], };
        const timesamples = [timesample01, timesample02, timesample03, timesample04, timesample05];
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).send(timesamples)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
    });

    it('it should not POST a timesample non coherent with the measurement feature', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner,
            [{ "name": "a", "unit": "u", "type": "number", "dimension": 0 },
            { "name": "b", "unit": "u", "type": "number", "dimension": 1 }]
        );
        const thing = await factory.createThing("test-thing-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [0], timestamp: Date.now() }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).send(timesample)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('No match between timesample values size and feature items size');
    });

    it('it should not POST a timesample of a measurment with a thing not in list', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);          
        const thing = await factory.createThing("test-thing-1", owner); 
        const thing2 = await factory.createThing("test-thing-2", owner); 
        const device = await factory.createDevice("test-device-1", owner, [feature],[],null,null,null,[thing2]);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [1],timestamp: Date.now() }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getDeviceToken(device)).send(timesample)
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        res.body.details.should.contain("The thing in the measurement required is not in the list acceptable things of the device");
    });
});