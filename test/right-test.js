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
const VisibilityTypes = require('../types/visibilityTypes.js');  
chai.use(chaiHttp);
const before = require('./before-test.js');

// Test the /GET route
describe('/GET rights', () => {
    it('it should GET all the rights', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource1 = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const resource2 = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const resource3 = await factory.createTag("tag-test-3", owner, [], VisibilityTypes.private);
        await factory.createRight("right-test-1", resource1, "Tag", user, owner, []);
        await factory.createRight("right-test-2", resource2, "Tag", user, owner, []);
        await factory.createRight("right-test-3", resource3, "Tag", user, owner, []);
        const res = await chai.request(server).keepOpen().get('/v1/rights').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET a specific right', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, []);
        const res = await chai.request(server).keepOpen().get('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(right._id.toString());
    });

    it('it should not GET a fake right', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/rights/fake-right').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST rights', () => {
    it('it should not POST a right without resource field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", type: "Tag", user: user._id };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply a resource');
    });

    it('it should not POST a right with a not permitted resource type', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createScript("test-script-1", owner, "code", [], VisibilityTypes.private);
        const right = { _id: "test-right", type: "Script", resource: resource._id, user: user._id };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('is not a valid enum value');
    });

    it('it should not POST a right without type field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, user: user._id };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply the resource type');
    });

    it('it should not POST a right without user field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, type: "Tag" };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply the user');
    });

    it('it should not POST a right with resource and type mismatch', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, type: "Feature", user: user._id };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Resource not found');
    });

    it('it should not POST a right with a fake tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, type: "Tag", user: user._id, tags: ["fake-tag"] };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should POST a right', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, type: "Tag", user: user._id };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.resource.should.be.eql(resource._id);
    });

    it('it should POST a right using user username', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, type: "Tag", user: user.username };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.resource.should.be.eql(resource._id);
    });

    it('it should not POST a script with already existant _id field', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, type: "Tag", user: user._id };
        await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('The right already exists');
    });

    it('it should POST a list of rights', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource1 = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const resource2 = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const resource3 = await factory.createTag("tag-test-3", owner, [], VisibilityTypes.private);
        const rights = [ { _id: "test-right-1", resource: resource1._id, type: "Tag", user: user._id },
                         { _id: "test-right-2", resource: resource2._id, type: "Tag", user: user._id },
                         { _id: "test-right-3", resource: resource3._id, type: "Tag", user: user._id } ];
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(rights);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.rights.length.should.be.eql(3);
        res.body.rights[0].resource.should.be.eql(resource1._id);
        res.body.rights[1].resource.should.be.eql(resource2._id);
    });

    it('it should POST only not existing rights from a list', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource1 = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const resource2 = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const resource3 = await factory.createTag("tag-test-3", owner, [], VisibilityTypes.private);
        const rights = [ { _id: "test-right-1", resource: resource1._id, type: "Tag", user: user._id },
                         { _id: "test-right-2", resource: resource1._id, type: "Tag", user: user._id },
                         { _id: "test-right-3",resource: resource3._id, type: "Tag", user: user._id } ];
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(rights);
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.rights.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(1);
        res.body.errors[0].should.contain("The right already exists");
        res.body.rights[0].resource.should.contain(resource1._id);
        res.body.rights[1].resource.should.be.eql(resource3._id);
    });

    it('it should POST a right with tags', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag = await factory.createTag("tag-test-2", owner, [], VisibilityTypes.private);
        const right = { _id: "test-right", resource: resource._id, type: "Tag", user: user._id, tags:[tag] };
        const res = await chai.request(server).keepOpen().post('/v1/rights').set("Authorization", await factory.getUserToken(owner)).send(right);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.resource.should.be.eql(resource._id);
    });
});

//problem to cast username instead of _id
/*
// Test the /POST file route
describe('/POST right from file', () => {
    it('it should POST rights  from file csv', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const tag = await factory.createTag("tag1", user);
        const feature = await factory.createFeature("feature1", user);        
        const device = await factory.createDevice("device1", user, [feature]);        
        const thing = await factory.createThing("thing1", user);
        const testFile = './test/test/Rights_test.csv';
        
        
        const res = await chai.request(server).keepOpen().post('/v1/rights/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        console.log(res);
        res.should.have.status(200);        
        res.body.should.be.a('object');
        res.body.should.have.property('rights');
        res.body.rights.length.should.be.eql(4);
        res.body.errors.length.should.be.eql(0);        
        res.body.rights[0].should.have.property('_id');
        res.body.rights[0].should.have.property('type');        
        res.body.rights[0].should.have.property('resource');
        res.body.rights[0].should.have.property('user');
        res.body.rights[1].should.have.property('_id');
        res.body.rights[1].should.have.property('type');        
        res.body.rights[1].should.have.property('resource');
        res.body.rights[1].should.have.property('user');
        res.body.rights[2].should.have.property('_id');
        res.body.rights[2].should.have.property('type');        
        res.body.rights[2].should.have.property('resource');
        res.body.rights[2].should.have.property('user');
        res.body.rights[3].should.have.property('_id');
        res.body.rights[3].should.have.property('type');        
        res.body.rights[3].should.have.property('resource');
        res.body.rights[3].should.have.property('user');
        res.body.rights[0]._id.should.be.eql("right1");
        res.body.rights[1]._id.should.be.eql("right2");        
        res.body.rights[2]._id.should.be.eql("right3");
        res.body.rights[3]._id.should.be.eql("right4");
        res.body.rights[0].type.should.be.eql("Tag");
        res.body.rights[1].type.should.be.eql("Device");
        res.body.rights[2].type.should.be.eql("Feature");
        res.body.rights[3].type.should.be.eql("Thing");
        res.body.rights[0].resource.should.be.eql('tag1');        
        res.body.rights[1].resource.should.be.eql('device1');            
        res.body.rights[2].resource.should.be.eql('feature1');    
        res.body.rights[3].resource.should.be.eql('thing1');  
    });   
});
*/

// Test the /DELETE route
describe('/DELETE rights', () => {
    it('it should DELETE a right', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, []);
        const rights_before = await before.Right.find();
        rights_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const rights_after = await before.Right.find();
        rights_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake right', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, []);
        const rights_before = await before.Right.find();
        rights_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/rights/fake_right').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const rights_after = await before.Right.find();
        rights_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT rights', () => {
    it('it should PUT a right _id type thing', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        //const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);      
        const resource = await factory.createThing("test-thing-1", user, [], null, []);  
        const right = await factory.createRight("right-test-1", resource, "Thing", user, owner, [tag_1, tag_2]);
        const modification = { _id:"new-right-test-1" };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-right-test-1");
    });

    it('it should PUT a right _id type tags', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);              
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { _id:"new-right-test-1" };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-right-test-1");
    });

    it('it should PUT a right _id type feature', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createFeature("test-feature-1", user);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);              
        const right = await factory.createRight("right-test-1", resource, "Feature", user, owner, [tag_1, tag_2]);
        const modification = { _id:"new-right-test-1" };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-right-test-1");
    });

    it('it should PUT a right _id type device', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const resource = await factory.createDevice("test-device-1", user, [feature]);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);              
        const right = await factory.createRight("right-test-1", resource, "Device", user, owner, [tag_1, tag_2]);
        const modification = { _id:"new-right-test-1" };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-right-test-1");
    });

    it('it should PUT a right to add a tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { tags: { add: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);        
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a right _id and add a tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);  
        const tag_3 = await factory.createTag("test-tag-3", user);      
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { _id:"new-right-test-1",tags: { add: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-right-test-1");
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a right to remove a tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, [tag_1, tag_2, tag_3]);
        const modification = { tags: { remove: [tag_2._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(2);
    });

    it('it should PUT a right to add and remove tags', async () => {
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
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, [tag_1, tag_2, tag_3, tag_4]);
        const modification = { tags: { remove: [tag_2._id, tag_3._id], add: [tag_5._id, tag_6._id, tag_7._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(5);
    });

    it('it should not PUT a right adding a fake tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { tags: { add: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be added to the list not found');
    });

    it('it should not PUT a right removing a fake tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, [tag_1, tag_2]);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/rights/' + right._id).set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be removed from list not found');
    });

    it('it should not PUT a fake right', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const resource = await factory.createTag("tag-test-1", owner, [], VisibilityTypes.private);
        const right = await factory.createRight("right-test-1", resource, "Tag", user, owner, []);
        const modification = { access: { remove: ["fake_access"] } };
        const res = await chai.request(server).keepOpen().put('/v1/rights/fake-right').set("Authorization", await factory.getUserToken(owner)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});
