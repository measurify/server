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

describe('Access create things', () => {
    it('it should create a thing as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user_admin)).send(thing);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(thing._id);
    });

    it('it should create a thing as provider', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user_provider)).send(thing);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(thing._id);
    });

    it('it should not create a thing as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user_analyst)).send(thing);
        console.log(res.text)
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });
});

describe('Access read things', () => {
    it('it should get a public/private thing as admin or analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.public);
        const thing_private = await factory.createThing("test-thing-private", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
        res = await chai.request(server).get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
    });

    it('it should get a public thing as provider', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.public);
        let res = await chai.request(server).get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
    });

    it('it should not get a private thing as provider', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_private = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a public/private thing as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", user_provider_owner, [], null, [], VisibilityTypes.public);
        const thing_private = await factory.createThing("test-thing-private", user_provider_owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
    });
});

describe('Access modify things', () => {
    it('it should modify a thing as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());
    });

    it('it should modify a thing as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", user_provide_owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());
    });

    it('it should not modify a thing as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not modify a thing as provider non owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});
