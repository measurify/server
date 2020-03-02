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
const Measurement = mongoose.model('Measurement');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const User = mongoose.model('User');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// Test the /GET route
describe('/GET tags', () => {
    it('it should GET all the tags', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createTag("test-tag-1", user);
        await factory.createTag("test-tag-2", user);
        const res = await chai.request(server).get('/v1/tags').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific tag', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const res = await chai.request(server).get('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(tag._id.toString());
    });

    it('it should not GET a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/tags/fake-tag').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST tag', () => {
    it('it should not POST a tag without _id field', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = {}
        const res = await chai.request(server).post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should POST a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        res.body._id.should.be.eql(tag._id);
    });

    it('it should POST a tagged tag', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag = { _id: "test-text", tags: [ tag_1._id, tag_2._id ] };
        const res = await chai.request(server).post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        res.body.should.have.property('tags');
        res.body.tags.should.be.a('array');
        res.body.tags.length.should.be.eql(2);
        res.body._id.should.be.eql(tag._id);
    });

    it('it should not POST a tag with already existant _id field', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const already_existant_tag = await factory.createTag("test-text", user);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('the _id is already used');
    });

    it('it should not POST a tag with a fake tag', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const already_existant_tag = await factory.createTag("test-text", user);
        const tag = { _id: "test-text", tags: [ "fake_tag" ] }
        const res = await chai.request(server).post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should GET the tag posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/tags').set("Authorization", await factory.getUserToken(user))
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("test-text");
    });

    it('it should POST a list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }];
        const res = await chai.request(server).post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags[0]._id.should.be.eql(tags[0]._id);
        res.body.tags[1]._id.should.be.eql(tags[1]._id);
    });

    it('it should POST only not existing tags from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }, { _id: "test-text-3", user }, { _id: "test-text-4", user }, { _id: "test-text-5", user }];
        const res = await chai.request(server).post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain(tags[0]._id);
        res.body.errors[1].should.contain(tags[1]._id);
        res.body.tags[0]._id.should.be.eql(tags[2]._id);
        res.body.tags[1]._id.should.be.eql(tags[3]._id);
        res.body.tags[2]._id.should.be.eql(tags[4]._id);
    });
});

// Test the /DELETE route
describe('/DELETE tag', () => {
    it('it should DELETE a tag', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user);
        const tags_before = await Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const tags_after = await Feature.find();
        tags_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake tag', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-2", user);
        const tags_before = await Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/tags/fake_tag').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const tags_after = await Tag.find();
        tags_after.length.should.be.eql(1);
    });

    it('it should not DELETE a tag already used in a measurement', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const device = await factory.createDevice("test-device-4", user, [feature]);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag, tag2]);
        const tags_before = await Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await Tag.find();
        tags_after.length.should.be.eql(2);
    });

    it('it should not DELETE a tag already used in a device', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const device = await factory.createDevice("test-device-4", user, [feature], [tag]);
        const tags_before = await Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await Tag.find();
        tags_after.length.should.be.eql(2);
    });

    it('it should not DELETE a tag already used in a feature', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user, null, [tag]);
        const tags_before = await Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await Tag.find();
        tags_after.length.should.be.eql(2);
    });

    it('it should not DELETE a tag already used in a tag', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const tagged_tag = await factory.createTag("test-tag-3", user, [tag]);
        const tags_before = await Tag.find();
        tags_before.length.should.be.eql(3);
        const res = await chai.request(server).delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await Tag.find();
        tags_after.length.should.be.eql(3);
    });

    it('it should not DELETE a tag already used in a thing', async () => {
        factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing", user, [tag]);
        const tags_before = await Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await Tag.find();
        tags_after.length.should.be.eql(2);
    });
});