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
const Thing = mongoose.model('Thing');
const User = mongoose.model('User');
const UserRoles = require('../types/UserRoles.js');
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// Test the /GET route
describe('/GET thing', () => {
    it('it should GET all the things', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createThing("test-thing-1", user, [], null, [], null, null);
        await factory.createThing("test-thing-2", user, [], null, [], null, null);
        const res = await chai.request(server).get('/v1/things').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific thing', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-2", user, [], null, []);
        const res = await chai.request(server).get('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(thing._id.toString());
    });

    it('it should not GET a fake thing', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/things/fake-thing').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST thing', () => {
    it('it should not POST a thing without _id field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = {}
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(thing)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
    });

    it('it should not POST a thing with a fake tag', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = { _id: "test-thing-2", tags: ["fake-tag"] };
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(thing);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should not POST a device with a fake relation', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = { _id: "test-thing-2", relations: [ 'fake-Thing'] };
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(thing);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Relation not existent');
    });

    it('it should POST a thing', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(thing)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(thing._id);
    });

    it('it should not POST a thing with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = { _id: "test-thing-1" }
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(thing)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('the _id is already used');
    });

    it('it should GET the thing posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/things').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("test-thing-1");
    });

    it('it should POST a list of thing', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const things = [{ _id: "test-thing-3" },
        { _id: "test-thing-4" }];
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(things)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.things[0]._id.should.be.eql(things[0]._id);
        res.body.things[1]._id.should.be.eql(things[1]._id);
    });

    it('it should POST only not existing things from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const things = [{ _id: "test-thing-1" },
        { _id: "test-thing-2" },
        { _id: "test-thing-3" },
        { _id: "test-thing-4" },
        { _id: "test-thing-5" }];
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(things)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.things.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
        res.body.errors[0].should.contain(things[0]._id);
        res.body.errors[1].should.contain(things[2]._id);
        res.body.errors[2].should.contain(things[3]._id);
        res.body.things[0]._id.should.be.eql(things[1]._id);
        res.body.things[1]._id.should.be.eql(things[4]._id);
    });

    it('it should POST a thing with tags', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-2", user);
        const thing = { _id: "test-thing-2", tags: [tag] };
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(thing)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(thing._id);
        res.body.tags.length.should.be.eql(1);
    });

    it('it should POST a thing with relations', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-2", user);
        const relation1 = await factory.createThing("relation-1", user);
        const relation2 = await factory.createThing("relation-2", user);
        const thing = { _id: "test-thing-2", relations: [relation1, relation2] };
        const res = await chai.request(server).post('/v1/things').set("Authorization", await factory.getUserToken(user)).send(thing)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(thing._id);
        res.body.relations.length.should.be.eql(2);
    });
});

// Test the /DELETE route
describe('/DELETE thing', () => {
    it('it should DELETE a thing', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user, [], null, []);
        const things_before = await Thing.find();
        things_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const things_after = await Thing.find();
        things_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake thing', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const thing = await factory.createThing("test-thing-2", user, [], null, []);
        const things_before = await Thing.find();
        things_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/things/fake_thing').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const things_after = await Thing.find();
        things_after.length.should.be.eql(1);
    });

    it('it should not DELETE a thing by non-owner', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const thing = await factory.createThing("test-thing-1", user);
        const thing_before = await Thing.find();
        thing_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
        const things_after = await Thing.find();
        things_after.length.should.be.eql(1);
    });

    it('it should not DELETE a thing already used in a measurement', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const things_before = await Thing.find();
        things_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const things_after = await Thing.find();
        things_after.length.should.be.eql(1);
    });

    it('it should not DELETE a thing already used as a relation', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const relation = await factory.createThing("test-relation-1", user);
        const thing = await factory.createThing("test-thing-1", user, null, null, [relation]);
        const things_before = await Thing.find();
        things_before.length.should.be.eql(2);
        const res = await chai.request(server).delete('/v1/things/' + relation._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const things_after = await Thing.find();
        things_after.length.should.be.eql(2);
    });
});
