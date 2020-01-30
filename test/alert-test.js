// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const Alert = mongoose.model('Alert');
const User = mongoose.model('User');
const AlertTypes = require('../types/AlertTypes.js');
const UserRoles = require('../types/UserRoles.js');
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// Test the /GET route
describe('/GET alerts', () => {
    it('it should GET all owned alert', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const other = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const alert1_owned = await factory.createAlert(owner, device, null, "message1", null);
        const alert2_owned = await factory.createAlert(owner, device, null, "message2", null);
        const alert3_owned = await factory.createAlert(owner, device, null, "message3", null);
        const alert1_other = await factory.createAlert(other, device, null, "message1", null);
        const alert2_other = await factory.createAlert(other, device, null, "message2", null);
        const res = await chai.request(server).get('/v1/alerts').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET alerts paginated', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const alert1_owned = await factory.createAlert(owner, device, null, "message1", null);
        const alert2_owned = await factory.createAlert(owner, device, null, "message2", null);
        const alert3_owned = await factory.createAlert(owner, device, null, "message3", null);
        const res = await chai.request(server).get('/v1/alerts?limit=2&page=1').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res.body.limit.should.be.eql(2);
        res.body.page.should.be.eql(1);
        res.body.totalPages.should.be.eql(2);
    });
    
    it('it should GET alerts only of a specific device', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device1 = await factory.createDevice("test-device-1", owner, [feature]);
        const device2 = await factory.createDevice("test-device-2", owner, [feature]);
        const alert1_device1 = await factory.createAlert(owner, device1, null, "message1", null);
        const alert2_device1 = await factory.createAlert(owner, device1, null, "message2", null);
        const alert3_device1 = await factory.createAlert(owner, device1, null, "message3", null);
        const alert4_device2 = await factory.createAlert(owner, device2, null, "message1", null);
        const alert5_device2 = await factory.createAlert(owner, device2, null, "message2", null);
        let res = await chai.request(server).get('/v1/alerts?filter={"device":"test-device-1"}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).get('/v1/alerts?filter={"device":"test-device-2"}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });
});

// Test the /POST route
describe('/POST alert', () => {   
    it('it should not POST an alert without device field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const alert = {
            owner: user,
            date: new Date().toISOString,
            message: 'this is a message',
            type: AlertTypes.generic
        }
        const res = await chai.request(server).post('/v1/alerts').set("Authorization", await factory.getUserToken(user)).send(alert)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply a device');
    });

    it('it should not POST a alert with a fake device', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const alert = {
            owner: user,
            device: "fake_device",
            date: new Date().toISOString,
            message: 'this is a message',
            type: AlertTypes.generic
        }
        const res = await chai.request(server).post('/v1/alerts').set("Authorization", await factory.getUserToken(user)).send(alert)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Device not existent');
    });

    it('it should not POST a alert with a fake type', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const alert = {
            owner: user,
            device: device._id,
            date: new Date().toISOString,
            message: 'this is a message',
            type: "fake_type"
        }
        const res = await chai.request(server).post('/v1/alerts').set("Authorization", await factory.getUserToken(user)).send(alert)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('unrecognized alert type');
    });

    it('it should POST in a idempotent way', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const alert = {
            owner: user,
            device: device._id,
            date: Date.now(),
            message: 'this is a message',
            type: AlertTypes.generic
        }
        let res = await chai.request(server).post('/v1/alerts').set("Authorization", await factory.getUserToken(user)).send(alert);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res = await chai.request(server).post('/v1/alerts').set("Authorization", await factory.getUserToken(user)).send(alert)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('The alert already exists');
    });

    it('it should POST a list of alerts', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const alerts = [ 
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 1',
                type: AlertTypes.generic
            },
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 2',
                type: AlertTypes.generic
            }
        ];

        let res = await chai.request(server).post('/v1/alerts?verbose=false').set("Authorization", await factory.getUserToken(user)).send(alerts);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.saved.should.be.eql(2);
    });

    it('it should POST only correct alerts from a list', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const alerts = [ 
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 1',
                type: AlertTypes.generic
            },
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 2',
                type: "fake_type"
            },
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 3',
                type: AlertTypes.generic
            },
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 4',
                type: AlertTypes.generic
            }
        ];
        let res = await chai.request(server).post('/v1/alerts?verbose=false').set("Authorization", await factory.getUserToken(user)).send(alerts)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.saved.should.be.eql(3);
        res.body.errors.should.be.eql(1);
    });
});
