process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const Authentication = require('../security/authentication.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const UserRoles = require('../types/userRoles.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

// CREATE
describe('Access create measurement', () => {
    it('it should create a measurement as admin', async () => {      
const user_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const feature = await factory.createFeature("test-feature-1", user_admin);
        const device = await factory.createDevice("test-device-1", user_admin, [feature]);
        const thing = await factory.createThing("test-thing-1", user_admin);
        const measurement = { owner: user_admin, thing: thing._id, feature: feature._id, device: device._id, samples:[{values:10.4}] };
        const res = await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", await factory.getUserToken(user_admin)).send(measurement);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
    });

    it('it should create a measurement as provider', async () => {      
        const user_provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider);
        const device = await factory.createDevice("test-device-1", user_provider, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provider);
        const measurement = { owner: user_provider, thing: thing._id, feature: feature._id, device: device._id, samples:[{values:10.4}] };
        const res = await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", await factory.getUserToken(user_provider)).send(measurement);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
    });

    it('it should not create a measurement as analyst', async () => {      
const user_analyst = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature-1", user_analyst);
        const device = await factory.createDevice("test-device-1", user_analyst, [feature]);
        const thing = await factory.createThing("test-thing-1", user_analyst);
        const measurement = { owner: user_analyst, thing: thing._id, feature: feature._id, device: device._id, samples:[{values:10.4}] };
        const res = await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", await factory.getUserToken(user_analyst)).send(measurement);
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });
});

// READ LIST
describe('Access read a list of measurements', () => {
    it('it should get all the public/private measurements as admin or analyst', async () => {      
const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_1 = await factory.createThing("test-thing-1", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const thing_3 = await factory.createThing("test-thing-3", owner);
        const thing_4 = await factory.createThing("test-thing-4", owner);
        const thing_5 = await factory.createThing("test-thing-5", owner);
        const thing_6 = await factory.createThing("test-thing-6", owner);
        const thing_7 = await factory.createThing("test-thing-7", owner);
        const thing_8 = await factory.createThing("test-thing-8", owner);
        const measurement_public_1 = await factory.createMeasurement(owner, feature, device, thing_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_2 = await factory.createMeasurement(owner, feature, device, thing_2, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_3 = await factory.createMeasurement(owner, feature, device, thing_3, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_4 = await factory.createMeasurement(owner, feature, device, thing_4, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_5 = await factory.createMeasurement(owner, feature, device, thing_5, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private_1 = await factory.createMeasurement(owner, feature, device, thing_6, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_2 = await factory.createMeasurement(owner, feature, device, thing_7, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_3 = await factory.createMeasurement(owner, feature, device, thing_8, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
    });

    it('it should get just his own or public measurements as provider', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_1 = await factory.createThing("test-thing-1", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const thing_3 = await factory.createThing("test-thing-3", owner);
        const thing_4 = await factory.createThing("test-thing-4", owner);
        const thing_5 = await factory.createThing("test-thing-5", owner);
        const thing_6 = await factory.createThing("test-thing-6", owner);
        const thing_7 = await factory.createThing("test-thing-7", owner);
        const thing_8 = await factory.createThing("test-thing-8", owner);
        const thing_9 = await factory.createThing("test-thing-9", owner);
        const thing_10 = await factory.createThing("test-thing-10", owner);
        const measurement_public_1 = await factory.createMeasurement(owner, feature, device, thing_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_2 = await factory.createMeasurement(user_provider, feature, device, thing_2, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_3 = await factory.createMeasurement(owner, feature, device, thing_3, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_4 = await factory.createMeasurement(owner, feature, device, thing_4, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_5 = await factory.createMeasurement(owner, feature, device, thing_5, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private_1 = await factory.createMeasurement(owner, feature, device, thing_6, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_2 = await factory.createMeasurement(user_provider, feature, device, thing_7, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_3 = await factory.createMeasurement(user_provider, feature, device, thing_8, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_4 = await factory.createMeasurement(owner, feature, device, thing_9, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_5 = await factory.createMeasurement(owner, feature, device, thing_10, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).keepOpen().get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(10);
    });

    it('it should get a filtered list of his own or public measurements as provider', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_1 = await factory.createThing("test-thing-1-search", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const thing_3 = await factory.createThing("test-thing-3", owner);
        const thing_4 = await factory.createThing("test-thing-4-search", owner);
        const thing_5 = await factory.createThing("test-thing-5", owner);
        const thing_6 = await factory.createThing("test-thing-6", owner);
        const thing_7 = await factory.createThing("test-thing-7-search", owner);
        const thing_8 = await factory.createThing("test-thing-8", owner);
        const thing_9 = await factory.createThing("test-thing-9-search", owner);
        const thing_10 = await factory.createThing("test-thing-10", owner);
        const measurement_public_1 = await factory.createMeasurement(owner, feature, device, thing_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_2 = await factory.createMeasurement(user_provider, feature, device, thing_2, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_3 = await factory.createMeasurement(owner, feature, device, thing_3, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_4 = await factory.createMeasurement(owner, feature, device, thing_4, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_5 = await factory.createMeasurement(owner, feature, device, thing_5, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private_1 = await factory.createMeasurement(owner, feature, device, thing_6, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_2 = await factory.createMeasurement(user_provider, feature, device, thing_7, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_3 = await factory.createMeasurement(user_provider, feature, device, thing_8, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_4 = await factory.createMeasurement(owner, feature, device, thing_9, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_5 = await factory.createMeasurement(owner, feature, device, thing_10, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const filter = "{\"thing\":{\"$regex\": \"search\"}}";
        let res = await chai.request(server).keepOpen().get('/v1/measurements?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/measurements?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
    });

    it('it should get own or public measurements only of a specific tag AND (of a specific feature OR a specific device)', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin); 
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature1 = await factory.createFeature("test-feature-1", owner);
        const feature2 = await factory.createFeature("test-feature-2", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device1 = await factory.createDevice("test-device-1", owner, [feature1, feature2]);
        const device2 = await factory.createDevice("test-device-2", owner, [feature1, feature2]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature1, device2, thing, [tag1], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement2 = await factory.createMeasurement(user_provider, feature2, device1, thing, [tag1], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement3 = await factory.createMeasurement(owner, feature1, device1, thing, [tag1], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement4 = await factory.createMeasurement(owner, feature2, device2, thing, [tag1, tag2], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement5 = await factory.createMeasurement(user_provider, feature2, device2, thing, [tag1], factory.createSamples(5), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements?filter={"$and":[{"tags":"test-tag-1"}, {"$or":[{"feature":"test-feature-1"},{"device":"test-device-1"}]}]}').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/measurements?filter={"$and":[{"tags":"test-tag-1"}, {"$or":[{"feature":"test-feature-1"},{"device":"test-device-1"}]}]}').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should get own or public measurements only of a specific tag AND of a specific feature', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin); 
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature1 = await factory.createFeature("test-feature-1", owner);
        const feature2 = await factory.createFeature("test-feature-2", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device1 = await factory.createDevice("test-device-1", owner, [feature1, feature2]);
        const device2 = await factory.createDevice("test-device-2", owner, [feature1, feature2]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature1, device2, thing, [tag1], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement2 = await factory.createMeasurement(user_provider, feature2, device1, thing, [tag1], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement3 = await factory.createMeasurement(owner, feature1, device1, thing, [tag1], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement4 = await factory.createMeasurement(owner, feature2, device2, thing, [tag1, tag2], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement5 = await factory.createMeasurement(user_provider, feature2, device2, thing, [tag1], factory.createSamples(5), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements?filter={"tags":"test-tag-1", "feature":"test-feature-1"}').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res = await chai.request(server).keepOpen().get('/v1/measurements?filter={"tags":"test-tag-1", "feature":"test-feature-1"}').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
    });
});

// READ
describe('Access read a measurement', () => {
    it('it should get a public/private measurement as admin or analyst', async () => {      
const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement_public = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_private._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_private._id.toString());
    });

    it('it should get a public measurement as provider', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement_public = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
    });

    it('it should not get a private measurement as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement_private = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a public/private measurement as provider and owner', async () => {      
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user_provider_owner);
        const device = await factory.createDevice("test-device-1", user_provider_owner, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provider_owner);
        const measurement_public = await factory.createMeasurement(user_provider_owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private = await factory.createMeasurement(user_provider_owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_private._id.toString());
    });
});


// MODIFY 
describe('Access modify measurement', () => {
    it('it should modify a measurement as admin', async () => {      
const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(measurement._id.toString());
    });

    it('it should modify a measurement as provider and owner', async () => {      
const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user_provide_owner);
        const device = await factory.createDevice("test-device-1", user_provide_owner, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provide_owner);
        const measurement = await factory.createMeasurement(user_provide_owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(measurement._id.toString());
    });

    it('it should not modify a measurement as analyst', async () => {      
const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not modify a measurement as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});

// DELETE

describe('Access delete measurement', () => {
    it('it should delete a measurement as admin', async () => {      
const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a measurement as provider and owner', async () => {      
const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user_provide_owner);
        const device = await factory.createDevice("test-device-1", user_provide_owner, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provide_owner);
        const measurement = await factory.createMeasurement(user_provide_owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a measurement as analyst', async () => {      
const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_delete.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
    });

    it('it should not delete a measurement as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_delete.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
    });
});


// DELETE MORE
describe('Access delete a list of measurements', () => {
    it('it should delete a list of measurements as admin', async () => {      
const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_1 = await factory.createThing("test-thing-1", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const thing_3 = await factory.createThing("test-thing-3", owner);
        const thing_4 = await factory.createThing("test-thing-4", owner);
        const thing_5 = await factory.createThing("test-thing-5", owner);
        const thing_6 = await factory.createThing("test-thing-6", owner);
        const thing_7 = await factory.createThing("test-thing-7", owner);
        const thing_8 = await factory.createThing("test-thing-8", owner);
        const measurement_public_1 = await factory.createMeasurement(owner, feature, device, thing_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_2 = await factory.createMeasurement(owner, feature, device, thing_2, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_3 = await factory.createMeasurement(owner, feature, device, thing_3, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_4 = await factory.createMeasurement(owner, feature, device, thing_4, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_5 = await factory.createMeasurement(owner, feature, device, thing_5, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private_1 = await factory.createMeasurement(owner, feature, device, thing_6, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_2 = await factory.createMeasurement(owner, feature, device, thing_7, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_3 = await factory.createMeasurement(owner, feature, device, thing_8, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/measurements').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.deleted.should.be.eql(8);
    });

    it('it should not delete a list of measurements as analyst', async () => {      
const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_1 = await factory.createThing("test-thing-1", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const thing_3 = await factory.createThing("test-thing-3", owner);
        const thing_4 = await factory.createThing("test-thing-4", owner);
        const thing_5 = await factory.createThing("test-thing-5", owner);
        const thing_6 = await factory.createThing("test-thing-6", owner);
        const thing_7 = await factory.createThing("test-thing-7", owner);
        const thing_8 = await factory.createThing("test-thing-8", owner);
        const measurement_public_1 = await factory.createMeasurement(owner, feature, device, thing_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_2 = await factory.createMeasurement(owner, feature, device, thing_2, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_3 = await factory.createMeasurement(owner, feature, device, thing_3, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_4 = await factory.createMeasurement(owner, feature, device, thing_4, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_5 = await factory.createMeasurement(owner, feature, device, thing_5, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private_1 = await factory.createMeasurement(owner, feature, device, thing_6, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_2 = await factory.createMeasurement(owner, feature, device, thing_7, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_3 = await factory.createMeasurement(owner, feature, device, thing_8, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/measurements').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.restricted_access_delete.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
    });

    it('it should not delete just its own list of measurements as provider', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_1 = await factory.createThing("test-thing-1", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const thing_3 = await factory.createThing("test-thing-3", owner);
        const thing_4 = await factory.createThing("test-thing-4", owner);
        const thing_5 = await factory.createThing("test-thing-5", owner);
        const thing_6 = await factory.createThing("test-thing-6", owner);
        const thing_7 = await factory.createThing("test-thing-7", owner);
        const thing_8 = await factory.createThing("test-thing-8", owner);
        const measurement_public_1 = await factory.createMeasurement(owner, feature, device, thing_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_2 = await factory.createMeasurement(user_provider, feature, device, thing_2, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_3 = await factory.createMeasurement(owner, feature, device, thing_3, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_4 = await factory.createMeasurement(user_provider, feature, device, thing_4, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_5 = await factory.createMeasurement(owner, feature, device, thing_5, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private_1 = await factory.createMeasurement(user_provider, feature, device, thing_6, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_2 = await factory.createMeasurement(user_provider, feature, device, thing_7, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_3 = await factory.createMeasurement(user_provider, feature, device, thing_8, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/measurements').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.deleted.should.be.eql(5);
    });

    it('it should delete a filtered list of his own measurements as provider', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_1 = await factory.createThing("test-thing-1-search", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const thing_3 = await factory.createThing("test-thing-3", owner);
        const thing_4 = await factory.createThing("test-thing-4-search", owner);
        const thing_5 = await factory.createThing("test-thing-5", owner);
        const thing_6 = await factory.createThing("test-thing-6", owner);
        const thing_7 = await factory.createThing("test-thing-7-search", owner);
        const thing_8 = await factory.createThing("test-thing-8", owner);
        const thing_9 = await factory.createThing("test-thing-9-search", owner);
        const thing_10 = await factory.createThing("test-thing-10", owner);
        const measurement_public_1 = await factory.createMeasurement(user_provider, feature, device, thing_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_2 = await factory.createMeasurement(user_provider, feature, device, thing_2, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_3 = await factory.createMeasurement(owner, feature, device, thing_3, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_4 = await factory.createMeasurement(owner, feature, device, thing_4, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_public_5 = await factory.createMeasurement(owner, feature, device, thing_5, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private_1 = await factory.createMeasurement(owner, feature, device, thing_6, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_2 = await factory.createMeasurement(user_provider, feature, device,  thing_7, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_3 = await factory.createMeasurement(user_provider, feature, device, thing_8, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_4 = await factory.createMeasurement(owner, feature, device, thing_9, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_private_5 = await factory.createMeasurement(owner, feature, device, thing_10, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const filter = "{\"thing\":{\"$regex\": \"search\"}}";
        let res = await chai.request(server).keepOpen().delete('/v1/measurements?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.deleted.should.be.eql(2);
        res = await chai.request(server).keepOpen().delete('/v1/measurements?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.deleted.should.be.eql(2);
    });

    it('it should delete own measurements only of a specific tag AND (of a specific feature OR a specific device)', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin); 
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature1 = await factory.createFeature("test-feature-1", owner);
        const feature2 = await factory.createFeature("test-feature-2", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device1 = await factory.createDevice("test-device-1", owner, [feature1, feature2]);
        const device2 = await factory.createDevice("test-device-2", owner, [feature1, feature2]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature1, device2, thing, [tag1], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement2 = await factory.createMeasurement(user_provider, feature2, device1, thing, [tag1], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement3 = await factory.createMeasurement(owner, feature1, device1, thing, [tag1], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement4 = await factory.createMeasurement(owner, feature2, device2, thing, [tag1, tag2], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement5 = await factory.createMeasurement(user_provider, feature2, device2, thing, [tag1], factory.createSamples(5), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/measurements?filter={"$and":[{"tags":"test-tag-1"}, {"$or":[{"feature":"test-feature-1"},{"device":"test-device-1"}]}]}').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.deleted.should.be.eql(1);
        res = await chai.request(server).keepOpen().delete('/v1/measurements?filter={"$and":[{"tags":"test-tag-1"}, {"$or":[{"feature":"test-feature-1"},{"device":"test-device-1"}]}]}').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.deleted.should.be.eql(2);
    });
});

// RIGHTS
describe('Access measurements withs right as analyst', () => {
    it('it should get only measurements of features with rights as analyst', async () => {      
const analyst = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_right_1 = await factory.createFeature("test-feature-1", owner);
        const feature_right_2 = await factory.createFeature("test-feature-2", owner);
        const feature_noright_1 = await factory.createFeature("test-feature-3", owner);
        const feature_noright_2 = await factory.createFeature("test-feature-4", owner);
        const feature_noright_3 = await factory.createFeature("test-feature-5", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature_right_1, feature_right_2, feature_noright_1, feature_noright_2, feature_noright_3]);
        const thing = await factory.createThing("test-thing-1-search", owner);
        const right_1 = await factory.createRight(feature_right_1, "Feature", analyst, owner, []);
        const right_2 = await factory.createRight(feature_right_2, "Feature", analyst, owner, []);
        const measurement_right_1   = await factory.createMeasurement(owner, feature_right_1, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_right_2   = await factory.createMeasurement(owner, feature_right_1, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.public);
        const measurement_right_3   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(3), null, null, null, VisibilityTypes.public);
        const measurement_right_4   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_right_6   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(6), null, null, null, VisibilityTypes.public);
        const measurement_noright_1 = await factory.createMeasurement(owner, feature_noright_1, device, thing, [], factory.createSamples(7), null, null, null, VisibilityTypes.public);
        const measurement_noright_2 = await factory.createMeasurement(owner, feature_noright_1, device, thing, [], factory.createSamples(8), null, null, null, VisibilityTypes.public);
        const measurement_noright_3 = await factory.createMeasurement(owner, feature_noright_2, device, thing, [], factory.createSamples(9), null, null, null, VisibilityTypes.public);
        const measurement_noright_4 = await factory.createMeasurement(owner, feature_noright_3, device, thing, [], factory.createSamples(10), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(6);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(analyst));
        res.body.size.should.be.eql(6);
    });

    it('it should get only measurements of tags with rights as analyst', async () => {      
const analyst = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1-search", owner);
        const tag_right_1 = await factory.createTag("test-tag-1", owner);
        const tag_right_2 = await factory.createTag("test-tag-2", owner);
        const tag_noright_1 = await factory.createTag("test-tag-3", owner);
        const tag_noright_2 = await factory.createTag("test-tag-4", owner);
        const tag_noright_3 = await factory.createTag("test-tag-5", owner);
        const right_1 = await factory.createRight(tag_right_1, "Tag", analyst, owner, []);
        const right_2 = await factory.createRight(tag_right_2, "Tag", analyst, owner, []);
        const measurement_right_1   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_1], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_right_2   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_1], factory.createSamples(2), null, null, null, VisibilityTypes.public);
        const measurement_right_3   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_1, tag_right_2], factory.createSamples(3), null, null, null, VisibilityTypes.public);
        const measurement_right_4   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_2], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_2,tag_noright_3], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_right_6   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_2], factory.createSamples(6), null, null, null, VisibilityTypes.public);
        const measurement_right_7   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_2], factory.createSamples(7), null, null, null, VisibilityTypes.public);
        const measurement_noright_2 = await factory.createMeasurement(owner, feature, device, thing, [tag_noright_2], factory.createSamples(8), null, null, null, VisibilityTypes.public);
        const measurement_noright_3 = await factory.createMeasurement(owner, feature, device, thing, [tag_noright_2], factory.createSamples(9), null, null, null, VisibilityTypes.public);
        const measurement_noright_4 = await factory.createMeasurement(owner, feature, device, thing, [tag_noright_3], factory.createSamples(10), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(analyst));
        res.body.size.should.be.eql(7);
    });

    it('it should get only measurements of device with rights as analyst', async () => {      
const analyst = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device_right_1 = await factory.createDevice("test-device-1", owner, [feature]);
        const device_right_2 = await factory.createDevice("test-device-2", owner, [feature]);
        const device_noright_1 = await factory.createDevice("test-device-3", owner, [feature]);
        const device_noright_2 = await factory.createDevice("test-device-4", owner, [feature]);
        const device_noright_3 = await factory.createDevice("test-device-5", owner, [feature]);
        const thing = await factory.createThing("test-thing-1-search", owner);
        const right_1 = await factory.createRight(device_right_1, "Device", analyst, owner, []);
        const right_2 = await factory.createRight(device_right_2, "Device", analyst, owner, []);
        const measurement_right_1   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_right_2   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.public);
        const measurement_right_3   = await factory.createMeasurement(owner, feature, device_right_2, thing, [], factory.createSamples(3), null, null, null, VisibilityTypes.public);
        const measurement_right_4   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5   = await factory.createMeasurement(owner, feature, device_right_2, thing, [], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_right_6   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(6), null, null, null, VisibilityTypes.public);
        const measurement_right_7   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(7), null, null, null, VisibilityTypes.public);
        const measurement_noright_2 = await factory.createMeasurement(owner, feature, device_noright_1, thing, [], factory.createSamples(8), null, null, null, VisibilityTypes.public);
        const measurement_noright_3 = await factory.createMeasurement(owner, feature, device_noright_2, thing, [], factory.createSamples(9), null, null, null, VisibilityTypes.public);
        const measurement_noright_4 = await factory.createMeasurement(owner, feature, device_noright_3, thing, [], factory.createSamples(10), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(analyst));
        res.body.size.should.be.eql(7);
    });

    it('it should get only measurements of things with rights as analyst', async () => {      
const analyst = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_right_1 = await factory.createThing("test-thing-1-search", owner);
        const thing_right_2 = await factory.createThing("test-thing-2-search", owner);
        const thing_noright_1 = await factory.createThing("test-thing-3-search", owner);
        const thing_noright_2 = await factory.createThing("test-thing-4-search", owner);
        const thing_noright_3 = await factory.createThing("test-thing-5-search", owner);
        const right_1 = await factory.createRight(thing_right_1, "Thing", analyst, owner, []);
        const right_2 = await factory.createRight(thing_right_2, "Thing", analyst, owner, []);
        const measurement_right_1   = await factory.createMeasurement(owner, feature, device, thing_right_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_right_2   = await factory.createMeasurement(owner, feature, device, thing_right_2, [], factory.createSamples(2), null, null, null, VisibilityTypes.public);
        const measurement_right_3   = await factory.createMeasurement(owner, feature, device, thing_right_2, [], factory.createSamples(3), null, null, null, VisibilityTypes.public);
        const measurement_right_4   = await factory.createMeasurement(owner, feature, device, thing_right_1, [], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5   = await factory.createMeasurement(owner, feature, device, thing_right_2, [], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_right_6   = await factory.createMeasurement(owner, feature, device, thing_right_2, [], factory.createSamples(6), null, null, null, VisibilityTypes.public);
        const measurement_noright_7 = await factory.createMeasurement(owner, feature, device, thing_noright_1, [], factory.createSamples(7), null, null, null, VisibilityTypes.public);
        const measurement_noright_2 = await factory.createMeasurement(owner, feature, device, thing_noright_1, [], factory.createSamples(8), null, null, null, VisibilityTypes.public);
        const measurement_noright_3 = await factory.createMeasurement(owner, feature, device, thing_noright_2, [], factory.createSamples(9), null, null, null, VisibilityTypes.public);
        const measurement_noright_4 = await factory.createMeasurement(owner, feature, device, thing_noright_3, [], factory.createSamples(10), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(6);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(analyst));
        res.body.size.should.be.eql(6);
    });

    it('it should get only measurements of device and feature with rights as analyst', async () => {      
const analyst = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device_right_1 = await factory.createDevice("test-device-1", owner, [feature]);
        const device_right_2 = await factory.createDevice("test-device-2", owner, [feature]);
        const device_noright_1 = await factory.createDevice("test-device-3", owner, [feature]);
        const device_noright_2 = await factory.createDevice("test-device-4", owner, [feature]);
        const device_noright_3 = await factory.createDevice("test-device-5", owner, [feature]);
        const thing_right_1 = await factory.createThing("test-thing-1-search", owner);
        const thing_right_2 = await factory.createThing("test-thing-2-search", owner);
        const thing_noright_1 = await factory.createThing("test-thing-3-search", owner);
        const thing_noright_2 = await factory.createThing("test-thing-4-search", owner);
        const thing_noright_3 = await factory.createThing("test-thing-5-search", owner);
        const right_1 = await factory.createRight(thing_right_1, "Thing", analyst, owner, []);
        const right_2 = await factory.createRight(thing_right_2, "Thing", analyst, owner, []);
        const right_3 = await factory.createRight(device_right_1, "Device", analyst, owner, []);
        const right_4 = await factory.createRight(device_right_2, "Device", analyst, owner, []);
        const measurement_right_1   = await factory.createMeasurement(owner, feature, device_right_1, thing_right_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_right_2   = await factory.createMeasurement(owner, feature, device_right_1, thing_right_2, [], factory.createSamples(2), null, null, null, VisibilityTypes.public);
        const measurement_right_3   = await factory.createMeasurement(owner, feature, device_right_2, thing_right_2, [], factory.createSamples(3), null, null, null, VisibilityTypes.public);
        const measurement_right_4   = await factory.createMeasurement(owner, feature, device_right_2, thing_right_1, [], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5   = await factory.createMeasurement(owner, feature, device_right_2, thing_right_2, [], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_noright_1 = await factory.createMeasurement(owner, feature, device_right_1, thing_noright_1, [], factory.createSamples(6), null, null, null, VisibilityTypes.public);
        const measurement_noright_2 = await factory.createMeasurement(owner, feature, device_noright_2, thing_noright_1, [], factory.createSamples(7), null, null, null, VisibilityTypes.public);
        const measurement_noright_3 = await factory.createMeasurement(owner, feature, device_noright_2, thing_right_1, [], factory.createSamples(8), null, null, null, VisibilityTypes.public);
        const measurement_noright_4 = await factory.createMeasurement(owner, feature, device_noright_2, thing_noright_2, [], factory.createSamples(9), null, null, null, VisibilityTypes.public);
        const measurement_noright_5 = await factory.createMeasurement(owner, feature, device_noright_3, thing_noright_3, [], factory.createSamples(10), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(analyst));
        res.body.size.should.be.eql(5);
    });
});

describe('Access measurements withs right as provider', () => {
    it('it should get only his measurements of features with rights as provider', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_right_1 = await factory.createFeature("test-feature-1", owner);
        const feature_right_2 = await factory.createFeature("test-feature-2", owner);
        const feature_noright_1 = await factory.createFeature("test-feature-3", owner);
        const feature_noright_2 = await factory.createFeature("test-feature-4", owner);
        const feature_noright_3 = await factory.createFeature("test-feature-5", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature_right_1, feature_right_2, feature_noright_1, feature_noright_2, feature_noright_3]);
        const thing = await factory.createThing("test-thing-1-search", owner);
        const right_1 = await factory.createRight(feature_right_1, "Feature", provider, owner, []);
        const right_2 = await factory.createRight(feature_right_2, "Feature", provider, owner, []);
        const measurement_right_1_owned   = await factory.createMeasurement(provider, feature_right_1, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        const measurement_right_2_owned   = await factory.createMeasurement(provider, feature_right_1, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_right_3_noown   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement_right_4_noown_public   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5_noown   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(5), null, null, null, VisibilityTypes.private);
        const measurement_right_6_noown   = await factory.createMeasurement(owner, feature_right_2, device, thing, [], factory.createSamples(6), null, null, null, VisibilityTypes.private);
        const measurement_noright_1_noowne = await factory.createMeasurement(owner, feature_noright_1, device, thing, [], factory.createSamples(7), null, null, null, VisibilityTypes.private);
        const measurement_noright_2_noown = await factory.createMeasurement(owner, feature_noright_1, device, thing, [], factory.createSamples(8), null, null, null, VisibilityTypes.private);
        const measurement_noright_3_noown = await factory.createMeasurement(owner, feature_noright_2, device, thing, [], factory.createSamples(9), null, null, null, VisibilityTypes.private);
        const measurement_noright_4_noown = await factory.createMeasurement(owner, feature_noright_3, device, thing, [], factory.createSamples(10), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(provider));
        res.body.size.should.be.eql(3);
    });

    it('it should get only his measurements of devices with rights as provider', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device_right_1 = await factory.createDevice("test-device-1", owner, [feature]);
        const device_right_2 = await factory.createDevice("test-device-2", owner, [feature]);
        const device_noright_1 = await factory.createDevice("test-device-3", owner, [feature]);
        const device_noright_2 = await factory.createDevice("test-device-4", owner, [feature]);
        const device_noright_3 = await factory.createDevice("test-device-5", owner, [feature]);
        const thing = await factory.createThing("test-thing-1-search", owner);
        const right_1 = await factory.createRight(device_right_1, "Device", provider, owner, []);
        const right_2 = await factory.createRight(device_right_2, "Device", provider, owner, []);
        const measurement_right_1_owned   = await factory.createMeasurement(provider, feature, device_right_1, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        const measurement_right_2_owned   = await factory.createMeasurement(provider, feature, device_right_2, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_right_3_noown   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement_right_4_noown_public   = await factory.createMeasurement(owner, feature, device_right_2, thing, [], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5_noown   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(5), null, null, null, VisibilityTypes.private);
        const measurement_right_6_noown   = await factory.createMeasurement(owner, feature, device_right_1, thing, [], factory.createSamples(6), null, null, null, VisibilityTypes.private);
        const measurement_noright_1_noown = await factory.createMeasurement(owner, feature, device_noright_1, thing, [], factory.createSamples(7), null, null, null, VisibilityTypes.private);
        const measurement_noright_2_noown = await factory.createMeasurement(owner, feature, device_noright_1, thing, [], factory.createSamples(8), null, null, null, VisibilityTypes.private);
        const measurement_noright_3_noown = await factory.createMeasurement(owner, feature, device_noright_2, thing, [], factory.createSamples(9), null, null, null, VisibilityTypes.private);
        const measurement_noright_4_noown = await factory.createMeasurement(owner, feature, device_noright_3, thing, [], factory.createSamples(10), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(provider));
        res.body.size.should.be.eql(3);
    });

    it('it should get only his measurements of things with rights as provider', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_right_1 = await factory.createThing("test-thing-1-search", owner);
        const thing_right_2 = await factory.createThing("test-thing-2-search", owner);
        const thing_noright_1 = await factory.createThing("test-thing-3-search", owner);
        const thing_noright_2 = await factory.createThing("test-thing-4-search", owner);
        const thing_noright_3 = await factory.createThing("test-thing-5-search", owner);
        const right_1 = await factory.createRight(thing_right_1, "Thing", provider, owner, []);
        const right_2 = await factory.createRight(thing_right_2, "Thing", provider, owner, []);
        const measurement_right_1_owned   = await factory.createMeasurement(provider, feature, device, thing_right_1, [], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        const measurement_right_2_owned   = await factory.createMeasurement(provider, feature, device, thing_right_1, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_right_3_noown   = await factory.createMeasurement(owner, feature, device, thing_right_1, [], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement_right_4_noown_public   = await factory.createMeasurement(owner, feature, device, thing_right_1, [], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5_noown_public   = await factory.createMeasurement(owner, feature, device, thing_right_2, [], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_right_6_noown   = await factory.createMeasurement(owner, feature, device, thing_right_2, [], factory.createSamples(6), null, null, null, VisibilityTypes.private);
        const measurement_noright_1_noown = await factory.createMeasurement(owner, feature, device, thing_noright_1, [], factory.createSamples(7), null, null, null, VisibilityTypes.private);
        const measurement_noright_2_noown = await factory.createMeasurement(owner, feature, device, thing_noright_2, [], factory.createSamples(8), null, null, null, VisibilityTypes.private);
        const measurement_noright_3_noown = await factory.createMeasurement(owner, feature, device, thing_noright_2, [], factory.createSamples(9), null, null, null, VisibilityTypes.private);
        const measurement_noright_4_noown = await factory.createMeasurement(owner, feature, device, thing_noright_3, [], factory.createSamples(10), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(provider));
        res.body.size.should.be.eql(4);
    });

    it('it should get only his measurements of tags with rights as provider', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1-search", owner);
        const tag_right_1 = await factory.createTag("test-tag-1", owner);
        const tag_right_2 = await factory.createTag("test-tag-2", owner);
        const tag_noright_1 = await factory.createTag("test-tag-3", owner);
        const tag_noright_2 = await factory.createTag("test-tag-4", owner);
        const tag_noright_3 = await factory.createTag("test-tag-5", owner);
        const right_1 = await factory.createRight(tag_right_1, "Tag", provider, owner, []);
        const right_2 = await factory.createRight(tag_right_2, "Tag", provider, owner, []);
        const measurement_right_1_owned   = await factory.createMeasurement(provider, feature, device, thing, [tag_right_1, tag_noright_3], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        const measurement_right_2_owned   = await factory.createMeasurement(provider, feature, device, thing, [tag_right_1], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_right_3_noown   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_1], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement_right_4_noown_public   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_1], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5_noown_public   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_1, tag_noright_1], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_right_6_noown   = await factory.createMeasurement(owner, feature, device, thing, [tag_right_1], factory.createSamples(6), null, null, null, VisibilityTypes.private);
        const measurement_noright_1_noown = await factory.createMeasurement(owner, feature, device, thing, [tag_noright_1], factory.createSamples(7), null, null, null, VisibilityTypes.private);
        const measurement_noright_2_noown = await factory.createMeasurement(owner, feature, device, thing, [tag_noright_2], factory.createSamples(8), null, null, null, VisibilityTypes.private);
        const measurement_noright_3_noown = await factory.createMeasurement(owner, feature, device, thing, [tag_noright_3,  tag_right_2], factory.createSamples(9), null, null, null, VisibilityTypes.private);
        const measurement_noright_4_noown = await factory.createMeasurement(owner, feature, device, thing, [tag_noright_3, tag_right_1], factory.createSamples(10), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(provider));
        res.body.size.should.be.eql(4);
    });

    it('it should get only his measurements of things and tags with rights as provider', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing_right_1 = await factory.createThing("test-thing-1-search", owner);
        const thing_right_2 = await factory.createThing("test-thing-2-search", owner);
        const thing_noright_1 = await factory.createThing("test-thing-3-search", owner);
        const thing_noright_2 = await factory.createThing("test-thing-4-search", owner);
        const thing_noright_3 = await factory.createThing("test-thing-5-search", owner);
        const tag_right_1 = await factory.createTag("test-tag-1", owner);
        const tag_right_2 = await factory.createTag("test-tag-2", owner);
        const tag_noright_1 = await factory.createTag("test-tag-3", owner);
        const tag_noright_2 = await factory.createTag("test-tag-4", owner);
        const tag_noright_3 = await factory.createTag("test-tag-5", owner);
        const right_1 = await factory.createRight(thing_right_1, "Thing", provider, owner, []);
        const right_2 = await factory.createRight(thing_right_2, "Thing", provider, owner, []);
        const right_3 = await factory.createRight(tag_right_1, "Tag", provider, owner, []);
        const right_4 = await factory.createRight(tag_right_2, "Tag", provider, owner, []);
        const measurement_right_1_owned   = await factory.createMeasurement(provider, feature, device, thing_right_1, [tag_right_1], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        const measurement_right_2_owned   = await factory.createMeasurement(provider, feature, device, thing_right_2, [tag_right_2, tag_noright_1], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const measurement_right_3_noown   = await factory.createMeasurement(owner, feature, device, thing_right_1, [tag_right_2], factory.createSamples(3), null, null, null, VisibilityTypes.private);
        const measurement_right_4_noown_public   = await factory.createMeasurement(owner, feature, device, thing_right_1, [tag_right_1], factory.createSamples(4), null, null, null, VisibilityTypes.public);
        const measurement_right_5_noown_public   = await factory.createMeasurement(owner, feature, device, thing_right_2, [tag_right_2, tag_noright_2], factory.createSamples(5), null, null, null, VisibilityTypes.public);
        const measurement_right_6_noown   = await factory.createMeasurement(owner, feature, device, thing_right_2, [], factory.createSamples(6), null, null, null, VisibilityTypes.private);
        const measurement_noright_1_noown = await factory.createMeasurement(owner, feature, device, thing_noright_1, [tag_noright_1], factory.createSamples(7), null, null, null, VisibilityTypes.private);
        const measurement_noright_2_noown = await factory.createMeasurement(owner, feature, device, thing_right_1, [tag_noright_2, tag_noright_1], factory.createSamples(8), null, null, null, VisibilityTypes.private);
        const measurement_noright_3_noown = await factory.createMeasurement(owner, feature, device, thing_right_2, [tag_noright_3], factory.createSamples(9), null, null, null, VisibilityTypes.private);
        const measurement_noright_4_noown = await factory.createMeasurement(owner, feature, device, thing_noright_3, [tag_noright_1, tag_right_2], factory.createSamples(10), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements').set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/measurements/count').set('Authorization', await factory.getUserToken(provider));
        res.body.size.should.be.eql(4);
    });
});

describe('Access a single measurements with rights', () => {
    it('it should access a measurements with rights on thing', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(thing, "Thing", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(measurement._id.toString());
    });

    it('it should not access a measurements with a rights on a different thing', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const thing_other = await factory.createThing("test-thing-2", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(thing_other, "Thing", provider, owner, []);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_read.message);
    });

    it('it should access a measurements with rights on device', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(device, "Device", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(measurement._id.toString());
    });

    it('it should not access a measurements with a rights on a different device', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const device_other = await factory.createDevice("test-device-2", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(device_other, "Device", provider, owner, []);
        const measurement   = await factory.createMeasurement(owner, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should access a measurements with rights on device and other', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const device_other = await factory.createDevice("test-device-2", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right_1 = await factory.createRight(device, "Device", provider, owner, []);
        const right_2 = await factory.createRight(device_other, "Device", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(measurement._id.toString());
    });

    it('it should not access a measurements with a rights on a device but not on thing', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const thing_other = await factory.createThing("test-thing-2", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right_1 = await factory.createRight(device, "Device", provider, owner, []);
        const right_2 = await factory.createRight(thing_other, "Thing", provider, owner, []);
        const measurement   = await factory.createMeasurement(owner, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should access a measurements with rights on feature', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(feature, "Feature", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(measurement._id.toString());
    });

    it('it should not access a measurements with a rights on a different feature', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const feature_other = await factory.createFeature("test-feature-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(feature_other, "Feature", provider, owner, []);
        const measurement   = await factory.createMeasurement(owner, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should access a measurements with rights on feature and other', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const feature_other = await factory.createFeature("test-feature-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right_1 = await factory.createRight(feature, "Feature", provider, owner, []);
        const right_2 = await factory.createRight(feature_other, "Feature", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(measurement._id.toString());
    });

    it('it should not access a measurements with a rights on a feature but not on thing', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const thing_other = await factory.createThing("test-thing-2", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right_1 = await factory.createRight(feature, "Feature", provider, owner, []);
        const right_2 = await factory.createRight(thing_other, "Thing", provider, owner, []);
        const measurement   = await factory.createMeasurement(owner, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should access a measurements with rights on tag', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(tag, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(measurement._id.toString());
    });

    it('it should access a measurements with rights on tag and others', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const tag_4 = await factory.createTag("test-tag-4", owner);
        const tag_5 = await factory.createTag("test-tag-5", owner);
        const right_1 = await factory.createRight(tag_1, "Tag", provider, owner, []);
        const right_2 = await factory.createRight(tag_2, "Tag", provider, owner, []);
        const right_3 = await factory.createRight(tag_3, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag_2, tag_3, tag_4, tag_5], factory.createSamples(1), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(measurement._id.toString());
    });

    it('it should not access a measurements with a rights on a different tag', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const device_other = await factory.createDevice("test-device-2", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight(tag_other, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(owner, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should not access a measurements with rights on a different set of tags', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const tag_4 = await factory.createTag("test-tag-4", owner);
        const tag_5 = await factory.createTag("test-tag-5", owner);
        const right_1 = await factory.createRight(tag_1, "Tag", provider, owner, []);
        const right_2 = await factory.createRight(tag_2, "Tag", provider, owner, []);
        const right_3 = await factory.createRight(tag_3, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(owner, feature, device, thing, [tag_4, tag_5], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should not access a measurements with rights on tags but not on thing', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const thing_other = await factory.createThing("test-thing-2", owner);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const tag_4 = await factory.createTag("test-tag-4", owner);
        const tag_5 = await factory.createTag("test-tag-5", owner);
        const right_1 = await factory.createRight(tag_1, "Tag", provider, owner, []);
        const right_2 = await factory.createRight(tag_2, "Tag", provider, owner, []);
        const right_3 = await factory.createRight(tag_3, "Tag", provider, owner, []);
        const right_4 = await factory.createRight(thing_other, "Thing", provider, owner, []);
        const measurement   = await factory.createMeasurement(owner, feature, device, thing, [tag_2, tag_3, tag_4, tag_5], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });
});

describe('Create a measurements with rights', () => {
    it('it should not create a measurements without rights on thing', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const other_thing = await factory.createThing("test-thing-2", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(other_thing, "Thing", provider, owner, []);
        const request = { owner: provider, feature: feature._id, thing: thing._id, device: device._id, tags: [tag._id], samples: [{values: 10.4, delta: 200}] }
        let res = await chai.request(server).keepOpen().post('/v1/measurements/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should not create a measurements without rights on device', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const device_other = await factory.createDevice("test-device-2", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(device_other, "Device", provider, owner, []);
        const request = { owner: provider, feature: feature._id, thing: thing._id, device: device._id, tags: [tag._id], samples: [{values: 10.4, delta: 200}] }
        let res = await chai.request(server).keepOpen().post('/v1/measurements/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should not create a measurements without rights on feature', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const feature_other = await factory.createFeature("test-feature-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(feature_other, "Feature", provider, owner, []);
        const request = { owner: provider, feature: feature._id, thing: thing._id, device: device._id, tags: [tag._id], samples: [{values: 10.4, delta: 200}] }
        let res = await chai.request(server).keepOpen().post('/v1/measurements/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.body.message.should.be.a('string');
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should not create a measurements without rights on tag', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight(tag_other, "Tag", provider, owner, []);
        const request = { owner: provider, feature: feature._id, thing: thing._id, device: device._id, tags: [tag._id], samples: [{values: 10.4, delta: 200}] }
        let res = await chai.request(server).keepOpen().post('/v1/measurements/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.body.message.should.be.a('string');
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should create a measurements with rights', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right_1 = await factory.createRight(tag, "Tag", provider, owner, []);
        const right_2 = await factory.createRight(device, "Device", provider, owner, []);
        const request = { owner: provider, feature: feature._id, thing: thing._id, device: device._id, tags: [tag._id], samples: [{values: 10.4, delta: 200}] }
        let res = await chai.request(server).keepOpen().post('/v1/measurements/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Delete measurement with rights', () => {
    it('it should not delete a measurement without rights', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const device_other = await factory.createDevice("test-device-2", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight(tag_other, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should delete a measurement with rights', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(tag, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a measurement with rights as analyst', async () => {      
const analyst = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(feature, "Feature", analyst, owner, []);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(analyst));
        res.should.have.status(errors.restricted_access_delete.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_delete.message);
    });
});

describe('Modify measurements with rights', () => {
    it('it should not modify a measurement without rights', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const device_other = await factory.createDevice("test-device-2", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight(tag_other, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider)).send(modification);
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should modify a measurement with rights', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const device_other = await factory.createDevice("test-device-2", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(tag, "Tag", provider, owner, []);
        const measurement   = await factory.createMeasurement(provider, feature, device, thing, [tag], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/measurements/' + measurement._id).set('Authorization', await factory.getUserToken(provider)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});
