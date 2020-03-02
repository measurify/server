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
const IssueTypes = require('../types/issueTypes.js');
const UserRoles = require('../types/UserRoles.js');
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// Test the /GET route
describe('/GET issues', () => {
    it('it should GET all owned issues', async () => {
        factory.dropContents();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const other = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const issue1_owned = await factory.createIssue(owner, device, null, "message1", null);
        const issue2_owned = await factory.createIssue(owner, device, null, "message2", null);
        const issue3_owned = await factory.createIssue(owner, device, null, "message3", null);
        const issue1_other = await factory.createIssue(other, device, null, "message1", null);
        const issue2_other = await factory.createIssue(other, device, null, "message2", null);
        const res = await chai.request(server).get('/v1/issues').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET issues paginated', async () => {
        factory.dropContents();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const issue1_owned = await factory.createIssue(owner, device, null, "message1", null);
        const issue2_owned = await factory.createIssue(owner, device, null, "message2", null);
        const issue3_owned = await factory.createIssue(owner, device, null, "message3", null);
        const res = await chai.request(server).get('/v1/issues?limit=2&page=1').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res.body.limit.should.be.eql(2);
        res.body.page.should.be.eql(1);
        res.body.totalPages.should.be.eql(2);
    });
    
    it('it should GET issues only of a specific device', async () => {
        factory.dropContents();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device1 = await factory.createDevice("test-device-1", owner, [feature]);
        const device2 = await factory.createDevice("test-device-2", owner, [feature]);
        const issue1_device1 = await factory.createIssue(owner, device1, null, "message1", null);
        const issue2_device1 = await factory.createIssue(owner, device1, null, "message2", null);
        const issue3_device1 = await factory.createIssue(owner, device1, null, "message3", null);
        const issue4_device2 = await factory.createIssue(owner, device2, null, "message1", null);
        const issue5_device2 = await factory.createIssue(owner, device2, null, "message2", null);
        let res = await chai.request(server).get('/v1/issues?filter={"device":"test-device-1"}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).get('/v1/issues?filter={"device":"test-device-2"}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });
});

// Test the /POST route
describe('/POST issue', () => {   
    it('it should not POST an issue without device field', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const issue = {
            owner: user,
            date: new Date().toISOString,
            message: 'this is a message',
            type: IssueTypes.generic
        }
        const res = await chai.request(server).post('/v1/issues').set("Authorization", await factory.getUserToken(user)).send(issue)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply a device');
    });

    it('it should not POST a issue with a fake device', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const issue = {
            owner: user,
            device: "fake_device",
            date: new Date().toISOString,
            message: 'this is a message',
            type: IssueTypes.generic
        }
        const res = await chai.request(server).post('/v1/issues').set("Authorization", await factory.getUserToken(user)).send(issue)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Device not existent');
    });

    it('it should not POST a issue with a fake type', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const issue = {
            owner: user,
            device: device._id,
            date: new Date().toISOString,
            message: 'this is a message',
            type: "fake_type"
        }
        const res = await chai.request(server).post('/v1/issues').set("Authorization", await factory.getUserToken(user)).send(issue)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('unrecognized issue type');
    });

    it('it should POST in a idempotent way', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const issue = {
            owner: user,
            device: device._id,
            date: Date.now(),
            message: 'this is a message',
            type: IssueTypes.generic
        }
        let res = await chai.request(server).post('/v1/issues').set("Authorization", await factory.getUserToken(user)).send(issue);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res = await chai.request(server).post('/v1/issues').set("Authorization", await factory.getUserToken(user)).send(issue)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.should.have.status(errors.post_request_error.status);
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('The issue already exists');
    });

    it('it should POST a list of issues', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const issues = [ 
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 1',
                type: IssueTypes.generic
            },
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 2',
                type: IssueTypes.generic
            }
        ];

        let res = await chai.request(server).post('/v1/issues?verbose=false').set("Authorization", await factory.getUserToken(user)).send(issues);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.saved.should.be.eql(2);
    });

    it('it should POST only correct issues from a list', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature]);
        const issues = [ 
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 1',
                type: IssueTypes.generic
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
                type: IssueTypes.generic
            },
            {
                owner: user,
                device: device._id,
                date: Date.now(),
                message: 'this is a message 4',
                type: IssueTypes.generic
            }
        ];
        let res = await chai.request(server).post('/v1/issues?verbose=false').set("Authorization", await factory.getUserToken(user)).send(issues)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.saved.should.be.eql(3);
        res.body.errors.should.be.eql(1);
    });
});
