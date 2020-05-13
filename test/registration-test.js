// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database');
const server = require('../server');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory');
const User = mongoose.model('User');
const UserRoles = require('../types/userRoles');
const UserStatusTypes = require('../types/userStatusTypes');
const errors = require('../commons/errors');
const PasswordResetStatusTypes = require('../types/passwordResetStatusTypes');
const PasswordReset = mongoose.model('PasswordReset');

chai.use(chaiHttp);

// Create a new "self" user
describe('/POST self', () => {
    it('it should not POST a user without username field', async () => {
        await factory.dropContents();
        const user = { password : "test-password-1", email: "test-email-1", type : UserRoles.analyst };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `username` is required");
    });

    it('it should not POST a user without password field', async () => {
        await factory.dropContents();
        const user = { username : "test-username-1", email: "test-email-1", type : UserRoles.analyst };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `password` is required")
    });

    it('it should not POST a user without type field', async () => {
        await factory.dropContents();
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1" };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("Path `type` is required")
    });

    it('it should not POST a user with a fake type field', async () => {
        await factory.dropContents();
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : "fake-type" };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("unrecognized type")
    });
    
    it('it should not POST a user without email field', async () => {
        await factory.dropContents();
        const user = { username : "test-username-1", password : "test-password-1", type : UserRoles.analyst };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.missing_email.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_email.message);
    });

    it('it should POST a user', async () => {
        await factory.dropContents();
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('username');
        res.body.should.have.property('status');
        res.body.username.should.be.eql(user.username);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
    });

    it('it should not POST a user with already existant username field', async () => {
        await factory.dropContents();
        await factory.createUser("test-username-1", "test-password-1");
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("a user with the same username already exists")
    });

    it('it should not POST a user with already existant email', async () => {
        await factory.dropContents();
        await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1@test.it", type : UserRoles.analyst };
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain("a user with the same username already exists")
    });
});

// Confirm the created user
describe('/GET self', () => {
    it('it should GET a self user to awaiting a profile', async () => {
        await factory.dropContents();
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.awaiting);
    });

    it('it should PUT a self user to enable the profile as admin', async () => {
        await factory.dropContents();
        const user = { username : "test-username-1", password : "test-password-1", email: "test-email-1", type : UserRoles.analyst };
        let res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self').send(user);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.disabled);
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self/' + res.body._id);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.awaiting);
        const admin = await factory.createUser("test-username-2", "test-password-2", UserRoles.admin);
        const modification = { status: UserStatusTypes.enabled };
        res = await chai.request(server).keepOpen().put('/v1/users/' + res.body._id + '/status').set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(200);
        res.body.status.should.be.eql(UserStatusTypes.enabled);
    });

});

// Ask to reset a password
describe('/POST reset', () => {
    it('it should not POST a reset without email field', async () => {
        await factory.dropContents();
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset').send({});
        res.should.have.status(errors.missing_email.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_email.message);
    });

    it('it should not POST a reset for a fake email', async () => {
        await factory.dropContents();
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset').send({email: "fake_email"});
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should POST a reset request', async () => {
        await factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const res = await chai.request(server).keepOpen().post('/' + process.env.VERSION + '/self/reset').send({email: user.email});
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('request sent');
    });

});

// Confirm the password rest
describe('/PUT password', () => {
    it('it should GET a password reset', async () => {
        await factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self?reset=' + reset._id + '&password=my_new_password');
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('username');
    });

    it('it should not GET a password reset without password field', async () => {
        await factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self?reset=' + reset._id);
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not GET a password reset without reset field', async () => {
        await factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self?password=my_new_password');
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not GET a password reset with a fake reset', async () => {
        await factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        const res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self?reset=fake_reset&password=my_new_password');
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not GET a password reset with a fake reset', async () => {
        await factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", null, null, "test-email-1@test.it");
        const reset = await factory.createReset(user);
        let res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self?reset=' + reset._id + '&password=my_new_password');
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('username');
        res = await chai.request(server).keepOpen().get('/' + process.env.VERSION + '/self?reset=' + reset._id + '&password=my_new_password');
        res.should.have.status(errors.reset_invalid.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.reset_invalid.message);

    });
});