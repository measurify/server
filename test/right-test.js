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
const Right = mongoose.model('Right');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');
const VisibilityTypes = require('../types/visibilityTypes.js');  

chai.use(chaiHttp);

// Test the /GET route
describe('/GET rights', () => {
    it('it should GET all the rights', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource1 = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const resource2 = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const resource3 = await factory.createTag("tag-test-3", owner, [], VisibilityTypes.private);
        await factory.createRight(resource1, "Tag", user, owner, []);
        await factory.createRight(resource2, "Tag", user, owner, []);
        await factory.createRight(resource3, "Tag", user, owner, []);
        const res = await chai.request(server).get('/v1/rights').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET a specific right', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight(resource, "Tag", user, owner, []);
        const res = await chai.request(server).get('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(right._id.toString());
    });

    it('it should not GET a fake right', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/rights/fake-right').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST rights', () => {
    it('it should not POST a right without resource field', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { type: "Tag", user: user._id };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply a resource');
    });

    it('it should not POST a right with a not permitted resource type', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createScript("test-script-1", owner, "code", [], VisibilityTypes.private);
        const right = { type: "Script", resource: resource._id, user: user._id };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('resource type Script not valid');
    });

    it('it should not POST a right without type field', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, user: user._id };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply the resource type');
    });

    it('it should not POST a right without user field', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, type: "Tag" };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply the user');
    });

    it('it should not POST a right with resource and type mismatch', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, type: "Feature", user: user._id };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Resource not found');
    });

    it('it should not POST a right with a fake tag', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, type: "Tag", user: user._id, tags: ["fake-tag"] };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should POST a right', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, type: "Tag", user: user._id };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.resource.should.be.eql(resource._id);
    });

    it('it should POST a right using user username', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, type: "Tag", user: user.username };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.resource.should.be.eql(resource._id);
    });

    it('it should not POST a script with already existant _id field', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, type: "Tag", user: user._id };
        await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('The right already exists');
    });

    it('it should POST a list of rights', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource1 = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const resource2 = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const resource3 = await factory.createTag("tag-test-3", owner, [], VisibilityTypes.private);
        const rights = [ { resource: resource1._id, type: "Tag", user: user._id },
                         { resource: resource2._id, type: "Tag", user: user._id },
                         { resource: resource3._id, type: "Tag", user: user._id } ];
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(rights);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.rights.length.should.be.eql(3);
        res.body.rights[0].resource.should.be.eql(resource1._id);
        res.body.rights[1].resource.should.be.eql(resource2._id);
    });

    it('it should POST only not existing rights from a list', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource1 = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const resource2 = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const resource3 = await factory.createTag("tag-test-3", owner, [], VisibilityTypes.private);
        const rights = [ { resource: resource1._id, type: "Tag", user: user._id },
                         { resource: resource1._id, type: "Tag", user: user._id },
                         { resource: resource3._id, type: "Tag", user: user._id } ];
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(rights);
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.rights.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(1);
        res.body.errors[0].should.contain("The right already exists");
        res.body.rights[0].resource.should.contain(resource1._id);
        res.body.rights[1].resource.should.be.eql(resource3._id);
    });

    it('it should POST a right with tags', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const right = { resource: resource._id, type: "Tag", user: user._id, tags:[tag] };
        const res = await chai.request(server).post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.resource.should.be.eql(resource._id);
    });
});

// Test the /DELETE route
describe('/DELETE rights', () => {
    it('it should DELETE a right', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight(resource, "Tag", user, owner, []);
        const rights_before = await Right.find();
        rights_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const rights_after = await Right.find();
        rights_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake right', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight(resource, "Tag", user, owner, []);
        const rights_before = await Right.find();
        rights_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/rights/fake_right').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const rights_after = await Right.find();
        rights_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT rights', () => {
    it('it should PUT a right to add a tag', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const right = await factory.createRight(resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { tags: { add: [tag_3._id] } };
        const res = await chai.request(server).put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a right to remove a tag', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const right = await factory.createRight(resource, "Tag", user, owner, [tag_1, tag_2, tag_3]);
        const modification = { tags: { remove: [tag_2._id] } };
        const res = await chai.request(server).put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(2);
    });

    it('it should PUT a right to add and remove tags', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const tag_4 = await factory.createTag("test-tag-4", user);
        const tag_5 = await factory.createTag("test-tag-5", user);
        const tag_6 = await factory.createTag("test-tag-6", user);
        const tag_7 = await factory.createTag("test-tag-7", user);
        const right = await factory.createRight(resource, "Tag", user, owner, [tag_1, tag_2, tag_3, tag_4]);
        const modification = { tags: { remove: [tag_2._id, tag_3._id], add: [tag_5._id, tag_6._id, tag_7._id] } };
        const res = await chai.request(server).put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(5);
    });

    it('it should not PUT a right adding a fake tag', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const right = await factory.createRight(resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { tags: { add: ["fake_tag"] } };
        const res = await chai.request(server).put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be added to the list not found');
    });

    it('it should not PUT a right removing a fake tag', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const right = await factory.createRight(resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be removed from list not found');
    });

    it('it should not PUT a fake right', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight(resource, "Tag", user, owner, []);
        const modification = { access: { remove: ["fake_access"] } };
        const res = await chai.request(server).put('/v1/rights/fake-right').set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});