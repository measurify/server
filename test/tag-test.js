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
const before = require('./before-test.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

// Test the /GET route
describe('/GET tags', () => {
    it('it should GET all the tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createTag("test-tag-1", user);
        await factory.createTag("test-tag-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/tags').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const res = await chai.request(server).keepOpen().get('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(tag._id.toString());
    });

    it('it should not GET a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/tags/fake-tag').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST tag', () => {
    it('it should not POST a tag without _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = {}
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should POST a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('timestamp');
        res.body._id.should.be.eql(tag._id);
    });

    it('it should not POST a tag with an invalid visibility', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = { _id: "test-text", visibility: "invalid" };
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('is not a valid enum value');
    });

    it('it should POST a tagged tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag = { _id: "test-text", tags: [ tag_1._id, tag_2._id ] };
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag);
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
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const already_existant_tag = await factory.createTag("test-text", user);
        const tag = { _id: "test-text" }
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key');
    });

    it('it should not POST a tag with a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const already_existant_tag = await factory.createTag("test-text", user);
        const tag = { _id: "test-text", tags: [ "fake_tag" ] }
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should GET the tag posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = { _id: "test-text" };
        await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tag)
        const res = await chai.request(server).keepOpen().get('/v1/tags').set("Authorization", await factory.getUserToken(user))
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("test-text");
    });

    it('it should POST a list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }];
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags[0]._id.should.be.eql(tags[0]._id);
        res.body.tags[1]._id.should.be.eql(tags[1]._id);
    });

    it('it should POST only not existing tags from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        let tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }];
        await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
        tags = [{ _id: "test-text-1", user }, { _id: "test-text-2", user }, { _id: "test-text-3", user }, { _id: "test-text-4", user }, { _id: "test-text-5", user }];
        const res = await chai.request(server).keepOpen().post('/v1/tags').set("Authorization", await factory.getUserToken(user)).send(tags)
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

// Test the /POST file route
describe('/POST tag from file', () => {
    it('it should POST tags from file csv', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);        
        const testFile = './test/test/Tag_test.csv';        
        
        const res = await chai.request(server).keepOpen().post('/v1/tags/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('tags');
        res.body.tags.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(0);        
        res.body.tags[0].should.have.property('_id');
        res.body.tags[1].should.have.property('_id');
        res.body.tags[2].should.have.property('_id');
        res.body.tags[0]._id.should.be.eql("tag_test_1");
        res.body.tags[1]._id.should.be.eql("tag_test_2");        
        res.body.tags[2]._id.should.be.eql("tag_test_3");
    });   
});

// Test the /DELETE route
describe('/DELETE tag', () => {
    it('it should DELETE a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const tags_after = await before.Feature.find();
        tags_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-2", user);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/fake_tag').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(1);
    });

    it('it should not DELETE a tag already used in a measurement', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const device = await factory.createDevice("test-device-4", user, [feature]);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag, tag2]);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(2);
    });

    it('it should not DELETE a tag already used in a device', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const device = await factory.createDevice("test-device-4", user, [feature], [tag]);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(2);
    });

    it('it should not DELETE a tag already used in a feature', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user, null, [tag]);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(2);
    });

    it('it should not DELETE a tag already used in a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const tagged_tag = await factory.createTag("test-tag-3", user, [tag]);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(3);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(3);
    });

    it('it should not DELETE a tag already used in a thing', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing", user, [tag]);
        const tags_before = await before.Tag.find();
        tags_before.length.should.be.eql(2);
        const res = await chai.request(server).keepOpen().delete('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const tags_after = await before.Tag.find();
        tags_after.length.should.be.eql(2);
    });
});

describe('/PUT tag', () => {
    it('it should PUT a tag _id', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { _id:"new-test-tag-1" };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-tag-1");
    });

    it('it should PUT a tag visibility', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { visibility: VisibilityTypes.private };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('visibility');
        res.body.visibility.should.be.eql(VisibilityTypes.private);
    });

    it('it should PUT a tag _id and visibility', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { _id:"new-test-tag-1",visibility: VisibilityTypes.private};
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-tag-1");
        res.body.should.have.property('visibility');
        res.body.visibility.should.be.eql(VisibilityTypes.private);
    });

    it('it should not PUT a tag with an invalid visibility', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { visibility: "invalid" };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.unknown_value.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.unknown_value.message);
    });

    it('it should PUT a tag description', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { description: 'second' };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('description');
        res.body.description.should.be.eql('second');
    });

    it('it should PUT a tag list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const tag_2 = await factory.createTag("test-tag-2", user, [], VisibilityTypes.public);
        const tag_3 = await factory.createTag("test-tag-3", user, [], VisibilityTypes.public);
        const tag_4 = await factory.createTag("test-tag-4", user, [], VisibilityTypes.public);
        const tag = await factory.createTag("test-tag", user, ['test-tag-1', 'test-tag-2'], VisibilityTypes.public);
        const request = { tags: { add: ['test-tag-3', 'test-tag-4'], remove: ['test-tag-1'] } };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('tags');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should not PUT a tag owner', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user_1, [], VisibilityTypes.public);
        const request = { ownser: user_2._id };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user_1)).send(request);
        res.should.have.status(errors.incorrect_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.incorrect_info.message);
    });

    it('it should not PUT a tag as analyst', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { description: 'second' };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not PUT a tag of another provider', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user_1, [], VisibilityTypes.public);
        const request = { description: 'second' };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user_2)).send(request);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not PUT a tag without any field', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", user_1, [], VisibilityTypes.public);
        const request = { };
        const res = await chai.request(server).keepOpen().put('/v1/tags/' + tag._id).set("Authorization", await factory.getUserToken(user_1)).send(request);
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not PUT a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-2", user);
        const request = { visibility: VisibilityTypes.private };
        const res = await chai.request(server).keepOpen().put('/v1/tags/fake_tag').set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});