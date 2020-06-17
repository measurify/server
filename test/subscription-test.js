

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

// Test the /GET route
describe('/GET subscriptions', () => {
    it('it should GET all the subscriptions', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        await factory.createSubscription("test-subscription-1", owner, device, null, []);
        await factory.createSubscription("test-subscription-2", owner, null, thing, []);
        const res = await chai.request(server).keepOpen().get('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific subscription', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, device, null, []);
        await factory.createSubscription("test-subscription-2", owner, null, thing, []);
        const res = await chai.request(server).keepOpen().get('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(subscription._id.toString());
    });

    it('it should not GET a fake subscription', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const subscription = await factory.createSubscription("test-subscription-1", owner, device, null, []);
        const res = await chai.request(server).keepOpen().get('/v1/subscriptions/fake-subscription').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    }); 
});

// Test the /POST route
describe('/POST subscription', () => {
    it('it should not POST a subscription without _id field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const subscription = {}
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send(subscription)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply your Firebase push notification token');
    });

    it('it should not POST a subscription without thing or device field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const subscription = { token: "subscription-id" }
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('you have to provide a device or a thing');
    });

    it('it should not POST a subscription with a fake tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const subscription = { token: "subscription-id", device: device._id, tags: ["fake-tag"] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should not POST a subscription with a fake device', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const subscription = { token: "subscription-id", device: "fake-device" };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Device not existent');
    });

    it('it should not POST a subscription with a fake thing', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const subscription = { token: "subscription-id", thing: "fake-thing" };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Thing not existent');
    });

    it('it should POST a subscription for a device', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const subscription = { token: "subscription-id", device: device._id, tags: [tag1._id, tag2._id] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.token.should.be.eql(subscription.token);
    });

    it('it should POST a subscription for a thing', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const subscription = { token: "subscription-id", thing: thing._id, tags: [tag1._id, tag2._id] };
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.token.should.be.eql(subscription.token);
    });

    it('it should not POST a subscription already existant', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const subscription = { token: "subscription-id", device: device._id, tags: [tag1._id, tag2._id] };
        await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription)
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send (subscription)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('The subscription already exists');
    });

    it('it should POST a list of subscriptions', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscriptions = [{ token: "subscription-id-1", thing: thing._id, tags: [] },
                               { token: "subscription-id-2", thing: thing._id, tags: [] },
                               { token: "subscription-id-3", thing: thing._id, tags: [] },
                               { token: "subscription-id-4", thing: thing._id, tags: [] }];
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send(subscriptions);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.subscriptions[0].token.should.be.eql(subscriptions[0].token);
        res.body.subscriptions[1].token.should.be.eql(subscriptions[1].token);
    });

    it('it should POST only not existing subscriptions from a list', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing_1 = await factory.createThing("test-thing-1", owner);
        const thing_2 = await factory.createThing("test-thing-2", owner);
        const subscriptions = [{ token: "subscription-id-1", thing: thing_1._id, tags: [] },
                               { token: "subscription-id-1", thing: thing_1._id, tags: [] },  
                               { token: "subscription-id-2", thing: thing_1._id, tags: [] },
                               { token: "subscription-id-2", thing: thing_1._id, tags: [] },
                               { token: "subscription-id-2", thing: thing_2._id, tags: [] }];
        const res = await chai.request(server).keepOpen().post('/v1/subscriptions').set("Authorization", await factory.getUserToken(owner)).send(subscriptions)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.subscriptions.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain('The subscription already exists');
        res.body.errors[1].should.contain('The subscription already exists');
        res.body.subscriptions[0].token.should.contain(subscriptions[0].token);
        res.body.subscriptions[1].token.should.be.eql(subscriptions[2].token);
        res.body.subscriptions[2].token.should.be.eql(subscriptions[4].token);
    });
});

// Test the /DELETE route
describe('/DELETE subscription', () => {
    it('it should DELETE a subscription', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        const subscription_before = await Subscription.find();
        subscription_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const subscriptions_after = await Subscription.find();
        subscriptions_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake subscription', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, []);
        const subscription_before = await Subscription.find();
        subscription_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/subscriptions/fake_subscription').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const subscriptions_after = await Subscription.find();
        subscriptions_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT subscription', () => {
    it('it should PUT a subscription to add a tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, [tag_1, tag_2]);
        const modification = { tags: { add: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a subscription to remove a tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, [tag_1, tag_2, tag_3]);
        const modification = { tags: { remove: [tag_2._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.tags.length.should.be.eql(2);
    });

    it('it should PUT a subscription to add and remove tags', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const tag_4 = await factory.createTag("test-tag-4", owner);
        const tag_5 = await factory.createTag("test-tag-5", owner);
        const tag_6 = await factory.createTag("test-tag-6", owner);
        const tag_7 = await factory.createTag("test-tag-7", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, [tag_1, tag_2, tag_3, tag_4]);
        const modification = { tags: { remove: [tag_2._id, tag_3._id], add: [tag_5._id, tag_6._id, tag_7._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.tags.length.should.be.eql(5);
    });

    it('it should not PUT a subscription adding a fake tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, [tag_1, tag_2, tag_3]);
        const modification = { tags: { add: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be added to the list not found');
    });

    it('it should not PUT a subscription removing a fake tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, [tag_1, tag_2, tag_3]);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be removed from list not found');
    });

    it('it should not PUT a fake subscription', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, [tag_1, tag_2, tag_3]);
        const modification = { tags: { remove: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/subscriptions/fake-subscription').set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a subscription with a wrong field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", owner);
        const tag_2 = await factory.createTag("test-tag-2", owner);
        const tag_3 = await factory.createTag("test-tag-3", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        const subscription = await factory.createSubscription("test-subscription-1", owner, null, thing, [tag_1, tag_2, tag_3]);
        const modification = { fakefield: "fake-value", tags: { remove: [tag_1._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/subscriptions/' + subscription._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Request field cannot be updated ');
    });
});
