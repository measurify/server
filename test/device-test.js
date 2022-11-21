process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

// Test the /GET route
describe('/GET device', () => {
    it('it should GET all the devices', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createDevice("test-device-1", user);
        await factory.createDevice("test-device-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/devices').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific device', async () => {      
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

    it('a supplier should NOT GET anything', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.supplier);
        await factory.createDevice("test-device-1", user);
        await factory.createDevice("test-device-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/devices').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.docs.length.should.be.eql(0);
    });
});

// Test the /POST route
describe('/POST device', () => {
    it('it should not POST a device without _id field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = {}
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });
    /*CHANGED
    it('it should not POST a device without features field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = { _id: "test-device-1", owner: user }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply at least one feature');
    });
    */
    it('it should not POST a device with a fake feature', async () => {      
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
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = { _id: "test-device-2", owner: user, visibility: "fake-visibility", features: [await factory.createFeature("test-device-2-feature-good", user)] }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('is not a valid enum value for path ');
    });

    it('it should not POST a device with an invalid visibility', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = { _id: "test-device-2", owner: user, measurementBufferPolicy: "fake-policy", features: [await factory.createFeature("test-device-2-feature-good", user)] }
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('is not a valid enum value for path ');
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
        await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        const res = await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key');
    });

    it('it should GET the device posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = {
            _id: "test-device-1",
            owner: user,
            features: [await factory.createFeature("test-device-1-feature", user)]
        }
        await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(device)
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
        let devices = [
            { _id: "test-device-1", owner: user, features: [await factory.createFeature("test-device-1-feature-new", user)] },
            { _id: "test-device-3", owner: user, features: [await factory.createFeature("test-device-3-feature-new", user)] },
            { _id: "test-device-4", owner: user, features: [await factory.createFeature("test-device-4-feature-new", user)] }
        ];
        await chai.request(server).keepOpen().post('/v1/devices').set("Authorization", await factory.getUserToken(user)).send(devices)
        devices = [
            { _id: "test-device-1", owner: user, features: [await factory.createFeature("test-device-5-feature-new", user)] },
            { _id: "test-device-2", owner: user, features: [await factory.createFeature("test-device-6-feature-new", user)] },
            { _id: "test-device-3", owner: user, features: [await factory.createFeature("test-device-7-feature-new", user)] },
            { _id: "test-device-4", owner: user, features: [await factory.createFeature("test-device-8-feature-new", user)] },
            { _id: "test-device-5", owner: user, features: [await factory.createFeature("test-device-9-feature-new", user)] }
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


// Test the /POST file route
describe('/POST device from file', () => {
    it('it should POST devices  from file csv', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature1 = await factory.createFeature("feature1", user);
        const feature2 = await factory.createFeature("feature2", user);
        const feature3 = await factory.createFeature("feature3", user);
        const feature4 = await factory.createFeature("feature4", user);
        const testFile = './test/dummies/Device_test.csv';
        const res = await chai.request(server).keepOpen().post('/v1/devices/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('devices');
        res.body.devices.length.should.be.eql(4);
        res.body.errors.length.should.be.eql(0);        
        res.body.devices[0].should.have.property('_id');
        res.body.devices[0].should.have.property('features');
        res.body.devices[1].should.have.property('_id');
        res.body.devices[1].should.have.property('features');
        res.body.devices[2].should.have.property('_id');
        res.body.devices[2].should.have.property('features');
        res.body.devices[3].should.have.property('_id');
        res.body.devices[3].should.have.property('features');
        res.body.devices[0]._id.should.be.eql("device1");
        res.body.devices[1]._id.should.be.eql("device2");        
        res.body.devices[2]._id.should.be.eql("device3");
        res.body.devices[3]._id.should.be.eql("device4");
        res.body.devices[0].features.length.should.be.eql(1);
        res.body.devices[1].features.length.should.be.eql(2);
        res.body.devices[2].features.length.should.be.eql(2);
        res.body.devices[3].features.length.should.be.eql(1);
        res.body.devices[0].features[0].should.be.eql('feature1');        
        res.body.devices[1].features[0].should.be.eql('feature1');            
        res.body.devices[1].features[1].should.be.eql('feature2');    
        res.body.devices[2].features[0].should.be.eql('feature3');            
        res.body.devices[2].features[1].should.be.eql('feature4');                  
        res.body.devices[3].features[0].should.be.eql('feature4');
    });   
});


// Test the /DELETE route
describe('/DELETE device', () => {
    it('it should DELETE a device', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-1", user);
        const devices_before = await before.Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const devices_after = await before.Device.find();
        devices_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake device', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const device = await factory.createDevice("test-device-2", user);
        const devices_before = await before.Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/fake_device').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const devices_after = await before.Device.find();
        devices_after.length.should.be.eql(1);
    });
    
    it('it should not DELETE a device by non-owner', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const device = await factory.createDevice("test-device-2", user);
        const devices_before = await before.Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        const devices_after = await before.Device.find();
        devices_after.length.should.be.eql(1);
    });

    it('it should not DELETE a device already used in a measurement', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const devices_before = await before.Device.find();
        devices_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const devices_after = await before.Device.find();
        devices_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT device', () => {
    it('it should PUT a device _id', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const request = { _id:"new-test-device-1" };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-device-1");
    });    

    it('it should not PUT a device _id used in a measurement', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const request = { _id:"new-test-device-2" };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
    });

    it('it should not PUT a device _id with an _id used', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const devices_before = await before.Device.find();
        devices_before.length.should.be.eql(2);
        const request = { _id:"test-device-2" };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device1._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain("MongoError: E11000 duplicate key error collection");
        const devices_after = await before.Device.find();
        devices_after.length.should.be.eql(2);
    });

    it('it should PUT a device visibility', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const request = { visibility: VisibilityTypes.public };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('visibility');
        res.body.visibility.should.be.eql(VisibilityTypes.public);
    });

    it('it should PUT a device _id and visibility', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const request = { _id:"new-test-device-1", visibility: VisibilityTypes.public };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-device-1");
        res.body.should.have.property('visibility');
        res.body.visibility.should.be.eql(VisibilityTypes.public);
    });

    it('it should PUT a device period', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const request = { period: '25s' };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('period');
        res.body.period.should.be.eql('25s');
    });

    it('it should PUT a device list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const tag_2 = await factory.createTag("test-tag-2", user, [], VisibilityTypes.public);
        const tag_3 = await factory.createTag("test-tag-3", user, [], VisibilityTypes.public);
        const tag_4 = await factory.createTag("test-tag-4", user, [], VisibilityTypes.public);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], ['test-tag-1', 'test-tag-2']);
        const request = { tags: { add: ['test-tag-3', 'test-tag-4'], remove: ['test-tag-1'] } };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('tags');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a device list of features', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature_1 = await factory.createFeature("test-feature-1", user);
        const feature_2 = await factory.createFeature("test-feature-2", user);
        const feature_3 = await factory.createFeature("test-feature-3", user);
        const feature_4 = await factory.createFeature("test-feature-4", user);
        const device = await factory.createDevice("test-device-1", user, ['test-feature-1', 'test-feature-2']);
        const request = { features: { add: ['test-feature-3', 'test-feature-4'], remove: ['test-feature-1'] } };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('features');
        res.body.features.length.should.be.eql(3);
    });

    it('it should PUT a device list of scripts', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script_1 = await factory.createScript("test-script-1", user, "test-code-1");
        const script_2 = await factory.createScript("test-script-2", user, "test-code-2");
        const script_3 = await factory.createScript("test-script-3", user, "test-code-3");
        const script_4 = await factory.createScript("test-script-4", user, "test-code-4");
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, feature, [], [script_1._id, script_2._id]);
        const request = { scripts: { add: [script_3._id, script_4._id], remove: [script_1._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('scripts');
        res.body.scripts.length.should.be.eql(3);
    });

    it('it should not PUT a device owner', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-2", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_1);
        const device = await factory.createDevice("test-device-1", user_1, [feature]);
        const request = { owner: user_2._id };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user_1)).send(request);
        res.should.have.status(errors.incorrect_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.incorrect_info.message);
    });

    it('it should not PUT a device as analyst', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const request = { period: '25s' };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });

    it('it should not PUT a device of another provider', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_1);
        const device = await factory.createDevice("test-device-1", user_1, [feature]);
        const request = { period: '25s' };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user_2)).send(request);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });

    it('it should not PUT a device without any field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const request = { };
        const res = await chai.request(server).keepOpen().put('/v1/devices/' + device._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not PUT a fake device', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const request = { visibility: VisibilityTypes.private };
        const res = await chai.request(server).keepOpen().put('/v1/devices/fake_device').set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});