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

describe('Read things', () => {
    it('it should get a thing, public or private, as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.public);
        const thing_private = await factory.createThing("test-thing-private", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
    });

    it('it should get a thing, public or private, as owner', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.public);
        const thing_private = await factory.createThing("test-thing-private", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
    });

    it('it should get a public thing, but not a private one as non admin', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.public);
        const thing_private = await factory.createThing("test-thing-private", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
    });

    it('it should get a private thing only with read rights', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-private", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //create
        let right = await factory.createRight(thing, "Thing", user, [AccessTypes.create], owner, [], VisibilityTypes.public);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //update
        right = await factory.modifyRight(right, [AccessTypes.update]);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //delete
        right = await factory.modifyRight(right, [AccessTypes.delete]);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //read
        right = await factory.modifyRight(right, [AccessTypes.read]);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());
    });

    it('it should get a public thing anyway', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-private", owner, [], null, [], VisibilityTypes.public);
        //as admin
        let res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //as owner
        let right = await factory.createRight(thing, "Thing", user, [AccessTypes.create], owner, [], VisibilityTypes.public);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //as analyst without right
        right = await factory.modifyRight(right, [AccessTypes.update]);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //delete
        right = await factory.modifyRight(right, [AccessTypes.delete]);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access.message);
        //read
        right = await factory.modifyRight(right, [AccessTypes.read]);
        res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());
    });
});
