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
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// CREATE
describe('Access create feature', () => {
    it('it should create a feature as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const request = { _id: "feature-name-text", items: [{ name: "item-name-1", unit: "item-unit-1" }]}
        const res = await chai.request(server).post('/v1/features').set("Authorization", await factory.getUserToken(user_admin)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(request._id);
    });

    it('it should create a feature as provider', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const request = { _id: "feature-name-text", items: [{ name: "item-name-1", unit: "item-unit-1" }]}
        const res = await chai.request(server).post('/v1/features').set("Authorization", await factory.getUserToken(user_provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(request._id);
    });

    it('it should not create a feature as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const request = { _id: "feature-name-text", items: [{ name: "item-name-1", unit: "item-unit-1" }]}
        const res = await chai.request(server).post('/v1/features').set("Authorization", await factory.getUserToken(user_analyst)).send(request);
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });
});

// READ LIST
describe('Access read a list of features', () => {
    it('it should get all the public/private features as admin or analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public_1 = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_public_2 = await factory.createFeature("test-feature-2-public", owner, null, [], VisibilityTypes.public);
        const feature_public_3 = await factory.createFeature("test-feature-3-public", owner, null, [], VisibilityTypes.public);
        const feature_public_4 = await factory.createFeature("test-feature-4-public", owner, null, [], VisibilityTypes.public);
        const feature_public_5 = await factory.createFeature("test-feature-5-public", owner, null, [], VisibilityTypes.public);
        const feature_private_1 = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        const feature_private_2 = await factory.createFeature("test-feature-2-private", owner, null, [], VisibilityTypes.private);
        const feature_private_3 = await factory.createFeature("test-feature-3-private", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
    });

    it('it should get just his own or public features as provider', async () => {
        await mongoose.connection.dropDatabase();
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
        let res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(10);
    });

    it('it should get a filtered list of his own or public features as provider', async () => {
        await mongoose.connection.dropDatabase();
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
        let res = await chai.request(server).get('/v1/features?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).get('/v1/features?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
    });
});

// READ
describe('Access read a feature', () => {
    it('it should get a public/private feature as admin or analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        const feature_private = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
        res = await chai.request(server).get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_private._id.toString());
        res = await chai.request(server).get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
        res = await chai.request(server).get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_private._id.toString());
    });

    it('it should get a public feature as provider', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_public = await factory.createFeature("test-feature-1-public", owner, null, [], VisibilityTypes.public);
        let res = await chai.request(server).get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
    });

    it('it should not get a private feature as provider not owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature_private = await factory.createFeature("test-feature-1-private", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a public/private feature as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature_public = await factory.createFeature("test-feature-1-public", user_provider_owner, null, [], VisibilityTypes.public);
        const feature_private = await factory.createFeature("test-feature-1-private", user_provider_owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).get('/v1/features/' + feature_public._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_public._id.toString());
        res = await chai.request(server).get('/v1/features/' + feature_private._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature_private._id.toString());
    });
});

// MODIFY
describe('Access modify features', () => {
    it('it should modify a feature as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(feature._id.toString());
    });

    it('it should modify a feature as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provide_owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(feature._id.toString());
    });

    it('it should not modify a feature as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not modify a feature as provider not owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});

// DELETE

describe('Access delete features', () => {
    it('it should delete a feature as admin', async () => {
        await mongoose.connection.dropDatabase();
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        let res = await chai.request(server).delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a feature as provider and owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provide_owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provide_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a feature as analyst', async () => {
        await mongoose.connection.dropDatabase();
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });

    it('it should not delete a feature as provider not owner', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.private);
        let res = await chai.request(server).delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });
});

// RIGTHS
describe('Access features with rights', () => {
    it('it should get all the public/private features with rights as analyst', async () => {
        await mongoose.connection.dropDatabase();
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
        const right_1 = await factory.createRight(feature_public_1, "Feature", user_analyst, owner, []);
        const right_2 = await factory.createRight(feature_public_2, "Feature", user_analyst, owner, []);
        const right_3 = await factory.createRight(feature_private_1, "Feature", user_analyst, owner, []);
        let res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should get all the public owned features with rights as provider', async () => {
        await mongoose.connection.dropDatabase();
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
        const right_1 = await factory.createRight(feature_private_2, "Feature", user_provider, owner, []);
        const right_2 = await factory.createRight(feature_private_1, "Feature", user_provider, owner, []);
        const right_3 = await factory.createRight(feature_public_1, "Feature", user_provider, owner, []);
        const right_4 = await factory.createRight(feature_public_2, "Feature", user_provider, owner, []);
        let res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).get('/v1/features/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should not read a feature without rights', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const feature_owned = await factory.createFeature("test-feature-2", owner, null, [], VisibilityTypes.public);
        const right_1 = await factory.createRight(feature_owned, "Feature", user_provider, owner, []);
        const right_2 = await factory.createRight(feature_owned, "Feature", user_analyst, owner, []);
        let res = await chai.request(server).get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
        res = await chai.request(server).get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should read a feature with rights', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner, null, [], VisibilityTypes.public);
        const right_1 = await factory.createRight(feature, "Feature", user_provider, owner, []);
        const right_2 = await factory.createRight(feature, "Feature", user_analyst, owner, []);
        let res = await chai.request(server).get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature._id.toString());
        res = await chai.request(server).get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature._id.toString());
    });
});

describe('Delete features with rights', () => {
    it('it should not delete a feature without rights', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const feature_owned = await factory.createFeature("test-feature-2", owner, null, [], VisibilityTypes.public);
        const right = await factory.createRight(feature_owned, "Feature", user_provider, owner, []);
        let res = await chai.request(server).delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should delete a feature with rights', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const right = await factory.createRight(feature, "Feature", user_provider, owner, []);
        let res = await chai.request(server).delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Modify features with rights', () => {
    it('it should not modify a feature without rights', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const feature_owned = await factory.createFeature("test-feature-2", owner, null, [], VisibilityTypes.public);
        const right = await factory.createRight(feature_owned, "Feature", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should modify a feature with rights', async () => {
        await mongoose.connection.dropDatabase();
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user_provider, null, [], VisibilityTypes.public);
        const right = await factory.createRight(feature, "Feature", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).put('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Create a a feature with rights', () => {
    it('it should not create a feature without rights on tag', async () => {
        await mongoose.connection.dropDatabase();
        const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight(tag_other, "Tag", provider, owner, []);
        const request = { _id: "feature-name-text", items: [{ name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]};
        let res = await chai.request(server).post('/v1/features/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.body.message.should.be.a('string');
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should create a feature with rights', async () => {
        await mongoose.connection.dropDatabase();
        const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight(tag, "Tag", provider, owner, []);
        const request = { _id: "feature-name-text", items: [ { name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]}
        let res = await chai.request(server).post('/v1/features/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});