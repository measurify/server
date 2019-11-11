// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const Authentication = require('../security/authentication.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const User = mongoose.model('User');
const UserRoles = require('../types/userRoles.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const AccessTypes = require('../types/accessTypes.js');
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// CREATE
describe('Access create measurement', () => {
    it('it should create a measurement as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const feature = await factory.createFeature("test-feature-1", user_admin);
        const device = await factory.createDevice("test-device-1", user_admin, [feature]);
        const thing = await factory.createThing("test-thing-1", user_admin);
        const measurement = { owner: user_admin, thing: thing._id, feature: feature._id, device: device._id, samples:[{values:10.4}] };
        const res = await chai.request(server).post('/v1/measurements').set("Authorization", await factory.getUserToken(user_admin)).send(measurement);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
    });

    it('it should create a measurement as provider', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider);
        const device = await factory.createDevice("test-device-1", user_provider, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provider);
        const measurement = { owner: user_provider, thing: thing._id, feature: feature._id, device: device._id, samples:[{values:10.4}] };
        const res = await chai.request(server).post('/v1/measurements').set("Authorization", await factory.getUserToken(user_provider)).send(measurement);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
    });

    it('it should not create a measurement as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature-1", user_analyst);
        const device = await factory.createDevice("test-device-1", user_analyst, [feature]);
        const thing = await factory.createThing("test-thing-1", user_analyst);
        const measurement = { owner: user_analyst, thing: thing._id, feature: feature._id, device: device._id, samples:[{values:10.4}] };
        const res = await chai.request(server).post('/v1/measurements').set("Authorization", await factory.getUserToken(user_analyst)).send(measurement);
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });
});

// READ LIST
describe('Access read a list of measurements', () => {
    it('it should get all the public/private measurements as admin or analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
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
        let res = await chai.request(server).get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
    });

    it('it should get just his own or public measurements as provider', async () => {
        await mongoose.connection.dropDatabase();
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
        let res = await chai.request(server).get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).get('/v1/measurements/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(10);
    });

    it('it should get a filtered list of his own or public measurements as provider', async () => {
        await mongoose.connection.dropDatabase();
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
        let res = await chai.request(server).get('/v1/measurements?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).get('/v1/measurements?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
    });
});

// READ
describe('Access read a measurement', () => {
    it('it should get a public/private measurement as admin or analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement_public = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
        res = await chai.request(server).get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_private._id.toString());
        res = await chai.request(server).get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
        res = await chai.request(server).get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_private._id.toString());
    });

    it('it should get a public measurement as provider', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement_public = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
    });

    it('it should not get a private measurement as provider not owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement_private = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a public/private measurement as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user_provider_owner);
        const device = await factory.createDevice("test-device-1", user_provider_owner, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provider_owner);
        const measurement_public = await factory.createMeasurement(user_provider_owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement_private = await factory.createMeasurement(user_provider_owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/measurements/' + measurement_public._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_public._id.toString());
        res = await chai.request(server).get('/v1/measurements/' + measurement_private._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(measurement_private._id.toString());
    });
});


// MODIFY 
describe('Access modify measurement', () => {
    it('it should modify a measurement as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(measurement._id.toString());
    });

    it('it should modify a measurement as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user_provide_owner);
        const device = await factory.createDevice("test-device-1", user_provide_owner, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provide_owner);
        const measurement = await factory.createMeasurement(user_provide_owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(measurement._id.toString());
    });

    it('it should not modify a measurement as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not modify a measurement as provider not owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});

// DELETE

describe('Access delete measurement', () => {
    it('it should delete a measurement as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a measurement as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user_provide_owner);
        const device = await factory.createDevice("test-device-1", user_provide_owner, [feature]);
        const thing = await factory.createThing("test-thing-1", user_provide_owner);
        const measurement = await factory.createMeasurement(user_provide_owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a measurement as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_delete.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
    });

    it('it should not delete a measurement as provider not owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(2), null, null, null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).delete('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_delete.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
    });
});
