// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const Device = mongoose.model('Device');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// Test the /GET route
describe('/GET device', () => {
    it('it should GET all the devices', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createDevice("test-device-1", user);
        await factory.createDevice("test-device-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/devices').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific device', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const res = await chai.request(server).keepOpen().get('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(device._id.toString());
    });

    it('it should not GET a fake device', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/devices/fake-device').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST device', () => {
    it('it should not POST a device without _id field', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = {}
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should not POST a device without features field', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = { _id: "test-device-1", owner: user }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply at least one feature');
    });

    it('it should not POST a device with a fake feature', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = { _id: "test-device-2", owner: user, features: ["fake-feature"] }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Feature not existent');
    });

    it('it should not POST a device with a fake tag', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = { _id: "test-device-2", owner: user, tags: ["fake-tag"], features: [await factory.createFeature("test-device-2-feature-good", user)] }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should not POST a device with a fake buffer policy', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = { _id: "test-device-2", owner: user, measurementBufferPolicy: "fake-policy", features: [await factory.createFeature("test-device-2-feature-good", user)] }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('unrecognized measurement buffer policy');
    });

    it('it should POST a device', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = {
            _id: "test-device-1",
            owner: user,
            features: [await factory.createFeature("test-device-1-feature", user)]
        }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('features');
        res.body._id.should.be.eql(device._id);
        res.body.features.length.should.be.eql(1);
    });

    it('it should not POST a device with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = {
            _id: "test-device-1",
            owner: user,
            features: [await factory.createFeature("test-device-1-feature-2", user)]
        }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('the _id is already used');
    });

    it('it should GET the device posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/devices').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("test-device-1");
    });

    it('it should POST a list of devices', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const devices = [
                            { _id: "test-device-3", owner: user, features: [await factory.createFeature("test-device-3-feature-1", user)] },
                            { _id: "test-device-4", features: [await factory.createFeature("test-device-4-feature-2", user)] }
                        ];
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(devices)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.devices[0]._id.should.be.eql(devices[0]._id);
        res.body.devices[1]._id.should.be.eql(devices[1]._id);
    });

    it('it should POST only not existing devices from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const devices = [
                            { _id: "test-device-1", owner: user, features: [await factory.createFeature("test-device-1-feature-new", user)] },
                            { _id: "test-device-2", user, features: [await factory.createFeature("test-device-2-feature-new", user)] },
                            { _id: "test-device-3", user, features: [await factory.createFeature("test-device-3-feature-new", user)] },
                            { _id: "test-device-4", user, features: [await factory.createFeature("test-device-4-feature-new", user)] },
                            { _id: "test-device-5", user, features: [await factory.createFeature("test-device-5-feature-new", user)] }
                        ];
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(devices)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.devices.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
        res.body.errors[0].should.contain(devices[0]._id);
        res.body.errors[1].should.contain(devices[2]._id);
        res.body.errors[2].should.contain(devices[3]._id);
        res.body.devices[0]._id.should.be.eql(devices[1]._id);
        res.body.devices[1]._id.should.be.eql(devices[4]._id);

    });

    it('it should POST a device with tags', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = {
            _id: "test-device-1",
            owner: user,
            features: [await factory.createFeature("test-device-1-feature-2", user)],
            tags: [await factory.createTag("test-tag-2", user)]
        }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(device._id);
        res.body.tags.length.should.be.eql(1);
    });
});

// Test the /DELETE route
describe('/DELETE device', () => {
    it('it should DELETE a device', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user);
        const devices_before = await Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const devices_after = await Device.find();
        devices_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake device', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-2", user);
        const devices_before = await Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/fake_device').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const devices_after = await Device.find();
        devices_after.length.should.be.eql(1);
    });
    
    it('it should not DELETE a device by non-owner', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const device = await factory.createDevice("test-device-2", user);
        const devices_before = await Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
        const devices_after = await Device.find();
        devices_after.length.should.be.eql(1);
    });

    it('it should not DELETE a device already used in a measurement', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const devices_before = await Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const devices_after = await Device.find();
        devices_after.length.should.be.eql(1);
    });
});
