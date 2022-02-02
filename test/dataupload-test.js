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
const test = require('./before-test.js');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

// Test the /GET route
describe('/GET dataupload', () => {
    it('it should GET all the datauploads', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createDataupload("test-dataupload-1", user, null, 160, null, null, null);
        await factory.createDataupload("test-dataupload-2", user, null, 200, null, null, null);
        const res = await chai.request(server).keepOpen().get('/v1/datauploads').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific dataupload', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const dataupload = await factory.createDataupload("test-dataupload-2", user, null, 200, null, null, null);
        const res = await chai.request(server).keepOpen().get('/v1/datauploads/' + dataupload._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(dataupload._id.toString());
    });

    it('it should not GET a fake dataupload', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/datauploads/fake-dataupload').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /DELETE route
describe('/DELETE dataupload', () => {
    it('it should DELETE a dataupload', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const dataupload = await factory.createDataupload("test-dataupload-1", user, null, 160, null, null, null);
        const datauploads_before = await before.Dataupload.find();
        datauploads_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/datauploads/' + dataupload._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const datauploads_after = await before.Dataupload.find();
        datauploads_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake dataupload', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const dataupload = await factory.createDataupload("test-dataupload-2", user, null, 160, null, null, null);
        const datauploads_before = await before.Dataupload.find();
        datauploads_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/datauploads/fake_dataupload').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const datauploads_after = await before.Dataupload.find();
        datauploads_after.length.should.be.eql(1);
    });
    /*
    it('it should not DELETE a thing already used in a measurement', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const things_before = await before.Thing.find();
        things_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const things_after = await before.Thing.find();
        things_after.length.should.be.eql(1);
    });

    it('it should not DELETE a thing already used as a relation', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const relation = await factory.createThing("test-relation-1", user);
        const thing = await factory.createThing("test-thing-1", user, null, null, [relation]);
        const things_before = await before.Thing.find();
        things_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/things/' + relation._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const things_after = await before.Thing.find();
        things_after.length.should.be.eql(2);
    });
    */
});

/*
// Test the /PUT route
describe('/PUT thing', () => {
    it('it should PUT a thing to add a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2]);
        const modification = { tags: { add: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a thing to remove a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2, tag_3]);
        const modification = { tags: { remove: [tag_2._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(2);
    });

    it('it should PUT a thing to add and remove tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const tag_4 = await factory.createTag("test-tag-4", user);
        const tag_5 = await factory.createTag("test-tag-5", user);
        const tag_6 = await factory.createTag("test-tag-6", user);
        const tag_7 = await factory.createTag("test-tag-7", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2, tag_3, tag_4]);
        const modification = { tags: { remove: [tag_2._id, tag_3._id], add: [tag_5._id, tag_6._id, tag_7._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(5);
    });

    it('it should not PUT a thing adding a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2]);
        const modification = { tags: { add: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be added to the list not found');
    });

    it('it should not PUT a thing removing a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2]);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be removed from list not found');
    });

    it('it should not PUT a fake thing', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2]);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/things/fake-thing').set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a thing with a wrong field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2]);
        const modification = { tags: { remove: [tag_2._id] }, fakefield: "fake-value" };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Request field cannot be updated ');
    });
});
*/