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
describe('Access create subscriptions', () => {
    
    it('it should create a subscription as admin', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = { token: "subscription-id", thing: thing._id, tags: [] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send(subscription);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.token.should.be.eql(subscription.token);
    });

    it('it should create a subscription as provider', async () => {      
const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const owner = await factory.createUser("test-username-2", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", admin);
        const subscription = { token: "subscription-id", thing: thing._id, tags: [] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send(subscription);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.token.should.be.eql(subscription.token);
    });

    it('it should not create a subscription as analyst', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = { token: "subscription-id", thing: thing._id, tags: [] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send(subscription);
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });

    it('it should not create a subscription as provider without rights on thing', async () => {      
const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const thingnoright = await factory.createThing("test-thing-1", admin);
        const thingright = await factory.createThing("test-thing-2", admin);
        const right = await factory.createRight("right-test-1", thingright, "Thing", user, admin, []);
        const subscription = { token: "subscription-id", thing: thingnoright._id, tags: [] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(user)).send(subscription);
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should not create a subscription as provider without rights on device', async () => {      
const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", admin);
        const deviceright = await factory.createDevice("test-device-1", admin, [feature]);
        const devicenoright = await factory.createDevice("test-device-2", admin, [feature]);
        const right = await factory.createRight("right-test-1", deviceright, "Device", user, admin, []);
        const subscription = { token: "subscription-id", device: devicenoright._id, tags: [] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(user)).send(subscription);
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should create a subscription as provider with rights on device', async () => {      
const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", admin);
        const deviceright = await factory.createDevice("test-device-1", admin, [feature]);
        const devicenoright = await factory.createDevice("test-device-2", admin, [feature]);
        const right = await factory.createRight("right-test-1", deviceright, "Device", user, admin, []);
        const subscription = { token: "subscription-id", device: deviceright._id, tags: [] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(user)).send(subscription);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.token.should.be.eql(subscription.token);
    });
});

// READ LIST
describe('Access read a list of subscriptions', () => {
    it('it should get all the subscriptions as admin or analyst', async () => {      
const user_admin = await factory.createUser("test-username-user1", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user2", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription_1 = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        const subscription_2 = await factory.createSubscription("test-subscription-2", owner, null, thing, []);
        const subscription_3 = await factory.createSubscription("test-subscription-3", owner, null, thing, []);
        const subscription_4 = await factory.createSubscription("test-subscription-4", owner, null, thing, []);
        const subscription_5 = await factory.createSubscription("test-subscription-5", owner, null, thing, []);
        let res = await chai.request(server).keepOpen().get('/v1/subscriptions/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
        res = await chai.request(server).keepOpen().get('/v1/subscriptions/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
    });

    it('it should get just his own subscriptions as provider', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription_1 = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        const subscription_2 = await factory.createSubscription("test-subscription-2", owner, null, thing, []);
        const subscription_3 = await factory.createSubscription("test-subscription-3", user_provider, null, thing, []);
        const subscription_4 = await factory.createSubscription("test-subscription-4", user_provider, null, thing, []);
        const subscription_5 = await factory.createSubscription("test-subscription-5", owner, null, thing, []);
        let res = await chai.request(server).keepOpen().get('/v1/subscriptions/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res = await chai.request(server).keepOpen().get('/v1/subscriptions/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
    });

    it('it should get a filtered list of his own subscriptions as provider', async () => {      
const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing_1 = await factory.createThing("test-thing-1", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const subscription_1 = await factory.createSubscription("test-subscription-1", owner, null, thing_2, []);
        const subscription_2 = await factory.createSubscription("test-subscription-2", owner, null, thing_1, []);
        const subscription_3 = await factory.createSubscription("test-subscription-3", user_provider, null, thing_1, []);
        const subscription_4 = await factory.createSubscription("test-subscription-4", user_provider, null, thing_2, []);
        const subscription_5 = await factory.createSubscription("test-subscription-5", owner, null, thing_2, []);
        const subscription_6 = await factory.createSubscription("test-subscription-6", user_provider, null, thing_1, []);
        const subscription_7 = await factory.createSubscription("test-subscription-7", user_provider, null, thing_2, []);
        const subscription_8 = await factory.createSubscription("test-subscription-8", user_provider, null, thing_2, []);
        const filter = "{\"thing\":\"" + thing_2._id + "\"}";
        let res = await chai.request(server).keepOpen().get('/v1/subscriptions?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/subscriptions?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
    });
});

// READ
describe('Access read a subscription', () => {
    it('it should get a subscription as admin or analyst', async () => {      
const user_admin = await factory.createUser("test-username-user1", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user2", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        let res = await chai.request(server).keepOpen().get('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.token.should.eql(subscription.token.toString());
        res = await chai.request(server).keepOpen().get('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.token.should.eql(subscription.token.toString());
    });

    it('it should not get a subscription as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        let res = await chai.request(server).keepOpen().get('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a subscription as provider owner', async () => {      
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user_provider_owner);
        const subscription = await factory.createSubscription("test-subscription-1", user_provider_owner, null, thing, []);
        let res = await chai.request(server).keepOpen().get('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.token.should.eql(subscription.token.toString());
    });
});

// MODIFY
describe('Access modify subscriptions', () => {
    it('it should modify a subscription as admin', async () => {      
const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body.token.should.eql(subscription.token.toString());
    });

    it('it should modify a subscription as provider owner', async () => {      
const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user_provide_owner);
        const subscription = await factory.createSubscription("test-subscription-1", user_provide_owner, null, thing, []);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body.token.should.eql(subscription.token.toString());
    });

    it('it should not modify a subscription as not owner', async () => {      
const user = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});

// DELETE
describe('Access delete subscriptions', () => {
    it('it should delete a subscription as admin', async () => {      
const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        let res = await chai.request(server).keepOpen().delete('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a subscription as provider owner', async () => {      
const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user_provide_owner);
        const subscription = await factory.createSubscription("test-subscription-1", user_provide_owner, null, thing, []);
        let res = await chai.request(server).keepOpen().delete('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user_provide_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a subscription as not owner', async () => {      
const user = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        let res = await chai.request(server).keepOpen().delete('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.restricted_access_delete.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_delete.message);
    });
});

