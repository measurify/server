

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

// CREATE
describe('Access create things', () => {
    it('it should create a thing as admin', async () => {      
        const user_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).keepOpen().post('/v1/things').set("Authorization", await factory.getUserToken(user_admin)).send(thing);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(thing._id);
    });

    it('it should create a thing as provider', async () => {      
        const user_provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).keepOpen().post('/v1/things').set("Authorization", await factory.getUserToken(user_provider)).send(thing);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(thing._id);
    });

    it('it should not create a thing as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).keepOpen().post('/v1/things').set("Authorization", await factory.getUserToken(user_analyst)).send(thing);
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });
});

// READ LIST
describe('Access read a list of things', () => {
    it('it should get all the public/private things as admin or analyst', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public_1 = await factory.createThing("test-thing-public-1", owner, [], null, [], VisibilityTypes.public);
        const thing_public_2 = await factory.createThing("test-thing-public-2", owner, [], null, [], VisibilityTypes.public);
        const thing_public_3 = await factory.createThing("test-thing-public-3", owner, [], null, [], VisibilityTypes.public);
        const thing_public_4 = await factory.createThing("test-thing-public-4", owner, [], null, [], VisibilityTypes.public);
        const thing_public_5 = await factory.createThing("test-thing-public-5", owner, [], null, [], VisibilityTypes.public);
        const thing_private_1 = await factory.createThing("test-thing-private-1", owner, [], null, [], VisibilityTypes.private);
        const thing_private_2 = await factory.createThing("test-thing-private-2", owner, [], null, [], VisibilityTypes.private);
        const thing_private_3 = await factory.createThing("test-thing-private-3", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
    });

    it('it should get just his own or public things as provider', async () => {      
        const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public_1 = await factory.createThing("test-thing-public-1", owner, [], null, [], VisibilityTypes.public);
        const thing_public_2 = await factory.createThing("test-thing-public-2", user_provider, [], null, [], VisibilityTypes.public);
        const thing_public_3 = await factory.createThing("test-thing-public-3", owner, [], null, [], VisibilityTypes.public);
        const thing_public_4 = await factory.createThing("test-thing-public-4", user_provider, [], null, [], VisibilityTypes.public);
        const thing_public_5 = await factory.createThing("test-thing-public-5", user_provider, [], null, [], VisibilityTypes.public);
        const thing_private_1 = await factory.createThing("test-thing-private-1", user_provider, [], null, [], VisibilityTypes.private);
        const thing_private_2 = await factory.createThing("test-thing-private-2", owner, [], null, [], VisibilityTypes.private);
        const thing_private_3 = await factory.createThing("test-thing-private-3", user_provider, [], null, [], VisibilityTypes.private);
        const thing_private_4 = await factory.createThing("test-thing-private-4", owner, [], null, [], VisibilityTypes.private);
        const thing_private_5 = await factory.createThing("test-thing-private-5", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(10);
    });

    it('it should get a filtered list of his own or public things as provider', async () => {      
        const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public_1 = await factory.createThing("test-thing-public-1", owner, [], null, [], VisibilityTypes.public);
        const thing_public_2 = await factory.createThing("test-thing-public-2-search", user_provider, [], null, [], VisibilityTypes.public);
        const thing_public_3 = await factory.createThing("test-thing-public-3-search", owner, [], null, [], VisibilityTypes.public);
        const thing_public_4 = await factory.createThing("test-thing-public-4", user_provider, [], null, [], VisibilityTypes.public);
        const thing_public_5 = await factory.createThing("test-thing-public-5", user_provider, [], null, [], VisibilityTypes.public);
        const thing_private_1 = await factory.createThing("test-thing-private-1", user_provider, [], null, [], VisibilityTypes.private);
        const thing_private_2 = await factory.createThing("test-thing-private-2-search", owner, [], null, [], VisibilityTypes.private);
        const thing_private_3 = await factory.createThing("test-thing-private-3-search", user_provider, [], null, [], VisibilityTypes.private);
        const thing_private_4 = await factory.createThing("test-thing-private-4", owner, [], null, [], VisibilityTypes.private);
        const thing_private_5 = await factory.createThing("test-thing-private-5-search", owner, [], null, [], VisibilityTypes.private);
        const filter = "{\"_id\":{\"$regex\": \"search\"}}";
        let res = await chai.request(server).keepOpen().get('/v1/things?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/things?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
    });
});

// READ
describe('Access read a thing', () => {
    it('it should get a public/private thing as admin or analyst', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.public);
        const thing_private = await factory.createThing("test-thing-private", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
    });

    it('it should get a public thing as provider', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
    });

    it('it should not get a private thing as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_private = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a public/private thing as provider and owner', async () => {      
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing_public = await factory.createThing("test-thing-public", user_provider_owner, [], null, [], VisibilityTypes.public);
        const thing_private = await factory.createThing("test-thing-private", user_provider_owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/things/' + thing_public._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/things/' + thing_private._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing_private._id.toString());
    });
});

// MODIFY
describe('Access modify things', () => {
    it('it should modify a thing as admin', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(thing._id.toString());
    });

    it('it should modify a thing as provider and owner', async () => {      
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", user_provide_owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(thing._id.toString());
    });

    it('it should not modify a thing as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not modify a thing as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});

// DELETE
describe('Access delete things', () => {
    it('it should delete a thing as admin', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a thing as provider and owner', async () => {      
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", user_provide_owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provide_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a thing as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });

    it('it should not delete a thing as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });
});

// RIGTHS
describe('Access things with rights', () => {
    it('it should get all the public/private things with rights as analyst', async () => {      
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public_1 = await factory.createThing("test-thing-1-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_2 = await factory.createThing("test-thing-2-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_3 = await factory.createThing("test-thing-3-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_4 = await factory.createThing("test-thing-4-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_5 = await factory.createThing("test-thing-5-public", owner, [], null, null, VisibilityTypes.public);
        const thing_private_1 = await factory.createThing("test-thing-1-private", owner, [], null, null, VisibilityTypes.private);
        const thing_private_2 = await factory.createThing("test-thing-2-private", owner, [], null, null, VisibilityTypes.private);
        const thing_private_3 = await factory.createThing("test-thing-3-private", owner, [], null, null, VisibilityTypes.private);
        const right_1 = await factory.createRight(thing_public_1, "Thing", user_analyst, owner, []);
        const right_2 = await factory.createRight(thing_public_2, "Thing", user_analyst, owner, []);
        const right_3 = await factory.createRight(thing_private_1, "Thing", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should get all the public owned things with rights as provider', async () => {      
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_public_1 = await factory.createThing("test-thing-1-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_2 = await factory.createThing("test-thing-2-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_3 = await factory.createThing("test-thing-3-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_4 = await factory.createThing("test-thing-4-public", owner, [], null, null, VisibilityTypes.public);
        const thing_public_5 = await factory.createThing("test-thing-5-public", owner, [], null, null, VisibilityTypes.public);
        const thing_private_1 = await factory.createThing("test-thing-1-private", owner, [], null, null, VisibilityTypes.private);
        const thing_private_2 = await factory.createThing("test-thing-2-private", user_provider, [], null, null, VisibilityTypes.private);
        const thing_private_3 = await factory.createThing("test-thing-3-private", owner, [], null, null, VisibilityTypes.private);
        const right_1 = await factory.createRight(thing_private_2, "Thing", user_provider, owner, []);
        const right_2 = await factory.createRight(thing_private_1, "Thing", user_provider, owner, []);
        const right_3 = await factory.createRight(thing_public_1, "Thing", user_provider, owner, []);
        const right_4 = await factory.createRight(thing_public_2, "Thing", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/things/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should not read a thing without rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner, [], null, null, VisibilityTypes.public);
        const thing_owned = await factory.createThing("test-thing-2", owner, [], null, null, VisibilityTypes.public);
        const right_1 = await factory.createRight(thing_owned, "Thing", user_provider, owner, []);
        const right_2 = await factory.createRight(thing_owned, "Thing", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
        res = await chai.request(server).keepOpen().get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should read a thing with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner, [], null, null, VisibilityTypes.public);
        const right_1 = await factory.createRight(thing, "Thing", user_provider, owner, []);
        const right_2 = await factory.createRight(thing, "Thing", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());
    });
});

describe('Delete things with rights', () => {
    it('it should not delete a thing without rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user_provider, [], null, null, VisibilityTypes.public);
        const thing_owned = await factory.createThing("test-thing-2", owner, [], null, null, VisibilityTypes.public);
        const right = await factory.createRight(thing_owned, "Thing", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should delete a thing with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user_provider, [], null, null, VisibilityTypes.public);
        const right = await factory.createRight(thing, "Thing", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Modify things with rights', () => {
    it('it should not modify a thing without rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user_provider, [], null, null, VisibilityTypes.public);
        const thing_owned = await factory.createThing("test-thing-2", owner, [], null, null, VisibilityTypes.public);
        const right = await factory.createRight(thing_owned, "Thing", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should modify a thing with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user_provider, [], null, null, VisibilityTypes.public);
        const right = await factory.createRight(thing, "Thing", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Create a a thing with rights', () => {
    it('it should not create a thing without rights on tag', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight(tag_other, "Tag", provider, owner, []);
        const request = { _id: "thing-name-text", items: [{ name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]};
        let res = await chai.request(server).keepOpen().post('/v1/things/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.body.message.should.be.a('string');
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should create a thing with rights', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(tag, "Tag", provider, owner, []);
        const request = { _id: "thing-name-text", items: [ { name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]}
        let res = await chai.request(server).keepOpen().post('/v1/things/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});
