

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
describe('Access create feature', () => {
    it('it should create a feature as admin', async () => {      
       const user_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const request = { _id: "feature-name-text", items: [{ name: "item-name-1", unit: "item-unit-1" }]}
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user_admin)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(request._id);
    });

    it('it should create a feature as provider', async () => {      
        const user_provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const request = { _id: "feature-name-text", items: [{ name: "item-name-1", unit: "item-unit-1" }]}
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user_provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(request._id);
    });

    it('it should not create a feature as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const request = { _id: "feature-name-text", items: [{ name: "item-name-1", unit: "item-unit-1" }]}
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user_analyst)).send(request);
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });
});

// READ LIST
describe('Access read a list of features', () => {
    it('it should get all the public/private features as admin or analyst', async () => {      
        const user_admin = await factory.createUser("test-username-user1", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user2", "test-password-user", UserRoles.analyst);
        const user_supplier = await factory.createUser("test-username-user-3", "test-password-user", UserRoles.supplier);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_supplier));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(0);
    });

    it('it should get just his own or public features as provider', async () => {      
        const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", user_provider, null, [], VisibilityTypes.private);
        const feature_private_4 = await factory.createFeature("test-feature-4-private", user_provider, null, [], VisibilityTypes.private);
        const feature_private_5 = await factory.createFeature("test-feature-5-private", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(10);
    });

    it('it should get a filtered list of his own or public features as provider', async () => {      
        const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public-search", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public-search", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private-search", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private-search", owner, null, [], VisibilityTypes.private);
        const feature_private_4 = await factory.createFeature("test-feature-4-private", owner, null, [], VisibilityTypes.private);
        const feature_private_5 = await factory.createFeature("test-feature-5-private-search", user_provider, null, [], VisibilityTypes.private);
        const filter = "{\"_id\":{\"$regex\": \"search\"}}";
        let res = await chai.request(server).keepOpen().get('/v1/features?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/features?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
    });
});

// READ
describe('Access read a feature', () => {
    it('it should get a public/private feature as admin or analyst', async () => {      
        const user_admin = await factory.createUser("test-username-user1", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user2", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_private = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_private._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_private._id.toString());
    });

    it('it should get a public feature as provider', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
    });

    it('it should not get a private feature as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_private = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a public/private feature as provider and owner', async () => {      
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature_public = await factory.createFeature("test-feature-1-public", user_provider_owner, null, [], VisibilityTypes.public);
        const feature_private = await factory.createFeature("test-feature-1-private", user_provider_owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_private._id.toString());
    });
});

// MODIFY
describe('Access modify features', () => {
    it('it should modify a feature as admin', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(feature._id.toString());
    });

    it('it should modify a feature as provider and owner', async () => {      
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provide_owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(feature._id.toString());
    });

    it('it should not modify a feature as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not modify a feature as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});

// DELETE

describe('Access delete features', () => {
    it('it should delete a feature as admin', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a feature as provider and owner', async () => {      
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provide_owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provide_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a feature as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });

    it('it should not delete a feature as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });
});

// RIGTHS
describe('Access features with rights', () => {
    it('it should get all the public/private features with rights as analyst', async () => {      
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", owner, null, [], VisibilityTypes.private);
        const right_1 = await factory.createRight("right-test-1", feature_public_1, "Feature", user_analyst._id, owner, []);
        const right_2 = await factory.createRight("right-test-2", feature_public_2, "Feature", user_analyst._id, owner, []);
        const right_3 = await factory.createRight("right-test-3", feature_private_1, "Feature", user_analyst._id, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should get all the public/private features with rights as analyst applied on multiple user', async () => {      
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst1 = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);        
        const user_analyst2 = await factory.createUser("test-username-user-3", "test-password-user-3", UserRoles.analyst);        
        const user_analyst3 = await factory.createUser("test-username-user-4", "test-password-user-4", UserRoles.analyst);        
        const user_analyst4 = await factory.createUser("test-username-user-5", "test-password-user-5", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);        
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", owner, null, [], VisibilityTypes.private);
        const device_public_1 = await factory.createDevice("test-device-1-public", owner, feature_public_1, [],null, VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", feature_public_1, "Feature", [user_analyst1._id,user_analyst2._id,user_analyst3._id,user_analyst4._id], owner, []);
        const right_2 = await factory.createRight("right-test-2", feature_public_2, "Feature", [user_analyst1._id,user_analyst2._id], owner, []);
        const right_3 = await factory.createRight("right-test-3", feature_private_1, "Feature", [user_analyst1._id,user_analyst3._id], owner, []);
        const right_4 = await factory.createRight("right-test-4", feature_private_2, "Feature", [user_analyst2._id,user_analyst4._id], owner, []);        
        const right_5 = await factory.createRight("right-test-5", feature_private_3, "Feature", [user_analyst2._id,user_analyst1._id], owner, []);
        const right_6 = await factory.createRight("right-test-6", device_public_1, "Device", [user_analyst1._id,user_analyst2._id,user_analyst3._id,user_analyst4._id], owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst2));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst3));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst4));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should get all the public/private features with rights applied to group', async () => {      
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst1 = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);        
        const user_analyst2 = await factory.createUser("test-username-user-3", "test-password-user-3", UserRoles.analyst);        
        const user_analyst3 = await factory.createUser("test-username-user-4", "test-password-user-4", UserRoles.analyst);        
        const user_analyst4 = await factory.createUser("test-username-user-5", "test-password-user-5", UserRoles.analyst);
        const group1 = await factory.createGroup("test-group-1", user_admin,[],null,VisibilityTypes.public,null,[user_analyst1._id,user_analyst2._id]);
        const group2 = await factory.createGroup("test-group-2", user_admin,[],null,VisibilityTypes.public,null,[user_analyst3._id,user_analyst4._id]);
        const group3 = await factory.createGroup("test-group-3", user_admin,[],null,VisibilityTypes.public,null,[user_analyst1._id,user_analyst3._id]);
        const group4 = await factory.createGroup("test-group-4", user_admin,[],null,VisibilityTypes.public,null,[user_analyst2._id,user_analyst4._id]);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);        
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", owner, null, [], VisibilityTypes.private);
        const device_public_1 = await factory.createDevice("test-device-1-public", owner, feature_public_1, [],null, VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", feature_public_1, "Feature", [], owner, [],null,[group1._id,group2._id]);
        const right_2 = await factory.createRight("right-test-2", feature_public_2, "Feature", [], owner, [],null,[group3._id,group4._id]);
        const right_3 = await factory.createRight("right-test-3", feature_private_1, "Feature", [], owner, [],null,[group1._id]);
        const right_4 = await factory.createRight("right-test-4", feature_private_2, "Feature", [], owner, [],null,[group2._id]);        
        const right_5 = await factory.createRight("right-test-5", feature_private_3, "Feature", [], owner, [],null,[group4._id]);
        const right_6 = await factory.createRight("right-test-6", device_public_1, "Device", [], owner, [],null,[group1._id,group2._id,group3._id,group4._id]);
        let res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst2));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst3));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst4));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
    });

    it('it should get all the public/private features with rights applied to user and to group', async () => {      
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst1 = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);        
        const user_analyst2 = await factory.createUser("test-username-user-3", "test-password-user-3", UserRoles.analyst);        
        const user_analyst3 = await factory.createUser("test-username-user-4", "test-password-user-4", UserRoles.analyst);        
        const user_analyst4 = await factory.createUser("test-username-user-5", "test-password-user-5", UserRoles.analyst);
        const group1 = await factory.createGroup("test-group-1", user_admin,[],null,VisibilityTypes.public,null,[user_analyst1._id]);
        const group2 = await factory.createGroup("test-group-2", user_admin,[],null,VisibilityTypes.public,null,[user_analyst2._id]);
        const group3 = await factory.createGroup("test-group-3", user_admin,[],null,VisibilityTypes.public,null,[user_analyst3._id]);
        const group4 = await factory.createGroup("test-group-4", user_admin,[],null,VisibilityTypes.public,null,[user_analyst4._id]);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);        
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", owner, null, [], VisibilityTypes.private);
        const device_public_1 = await factory.createDevice("test-device-1-public", owner, feature_public_1, [],null, VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", feature_public_1, "Feature", [user_analyst3._id], owner, [],null,[group1._id,group2._id]);
        const right_2 = await factory.createRight("right-test-2", feature_public_2, "Feature", [user_analyst1._id], owner, [],null,[group3._id,group4._id]);
        const right_3 = await factory.createRight("right-test-3", feature_private_1, "Feature", [user_analyst4._id], owner, [],null,[group1._id]);
        const right_4 = await factory.createRight("right-test-4", feature_private_2, "Feature", [user_analyst1._id,user_analyst2._id], owner, [],null,[group2._id]);        
        const right_5 = await factory.createRight("right-test-5", feature_private_3, "Feature", [user_analyst4._id], owner, [],null,[group4._id]);
        const right_6 = await factory.createRight("right-test-6", device_public_1, "Device", [user_analyst1._id,user_analyst2._id,user_analyst3._id,user_analyst4._id], owner, [],null,[group1._id,group2._id,group3._id,group4._id]);
        let res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst2));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst3));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst4));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should get all the public owned features with rights as provider', async () => {      
const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", user_provider, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", owner, null, [], VisibilityTypes.private);
        const right_1 = await factory.createRight("right-test-1", feature_private_2, "Feature", user_provider, owner, []);
        const right_2 = await factory.createRight("right-test-2", feature_private_1, "Feature", user_provider, owner, []);
        const right_3 = await factory.createRight("right-test-3", feature_public_1, "Feature", user_provider, owner, []);
        const right_4 = await factory.createRight("right-test-4", feature_public_2, "Feature", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/features/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should not read a feature without rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const feature_owned = await factory.createFeature("test-feature-2", owner, null, [], VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", feature_owned, "Feature", user_provider, owner, []);
        const right_2 = await factory.createRight("right-test-2", feature_owned, "Feature", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
        res = await chai.request(server).keepOpen().get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should read a feature with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", feature, "Feature", user_provider, owner, []);
        const right_2 = await factory.createRight("right-test-2", feature, "Feature", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature._id.toString());
    });
});

describe('Delete features with rights', () => {
    it('it should not delete a feature without rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const feature_owned = await factory.createFeature("test-feature-2", owner, null, [], VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", feature_owned, "Feature", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should delete a feature with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", feature, "Feature", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Modify features with rights', () => {
    it('it should not modify a feature without rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const feature_owned = await factory.createFeature("test-feature-2", owner, null, [], VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", feature_owned, "Feature", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should modify a feature with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", feature, "Feature", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Create a a feature with rights', () => {
    it('it should not create a feature without rights on tag', async () => {      
        const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight("right-test-1", tag_other, "Tag", provider, owner, []);
        const request = { _id: "feature-name-text", items: [{ name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]};
        let res = await chai.request(server).keepOpen().post('/v1/features/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.body.message.should.be.a('string');
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should create a feature with rights', async () => {      
        const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight("right-test-1", tag, "Tag", provider, owner, []);
        const request = { _id: "feature-name-text", items: [ { name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]}
        let res = await chai.request(server).keepOpen().post('/v1/features/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});
