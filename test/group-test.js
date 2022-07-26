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
describe('/GET group', () => {
    it('it should GET all the groups', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createGroup("test-group-1", user, [], null, null, null);
        await factory.createGroup("test-group-2", user, [], null, null, null);        
        const res = await chai.request(server).keepOpen().get('/v1/groups').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific group', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = await factory.createGroup("test-group-1", user, [], null, null, null);
        const res = await chai.request(server).keepOpen().get('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(group._id.toString());
    });

    it('it should not GET a fake group', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/groups/fake-group').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
    
    it("it should GET a specific group with user", async () => {
        const user = await factory.createUser("test-username-1", "test-password-1")
        const group = await factory.createGroup("test-group-1", user, [], null, null, null,[user._id]);        
        const res = await chai
        .request(server)
        .keepOpen()
        .get("/v1/groups/" + group._id)
        .set("Authorization", await factory.getAdminToken());    
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body._id.should.eql(group._id.toString());
        res.body.users.length.should.be.eql(1);
        res.body.users[0].should.be.eql(user._id.toString());
    });
});

// Test the /POST route
describe('/POST group', () => {
    it('it should not POST a group without _id field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = {}
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
    });

    it('it should not POST a group with a fake tag', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = { _id: "test-group-2", tags: ["fake-tag"] };
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });
    
    it('it should POST a group', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = { _id: "test-group-1" }
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(group._id);
    });

    it('it should not POST a group with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = { _id: "test-group-1" };
        await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key error');
    });

    it('it should GET the group posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = { _id: "test-group-1" };
        await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        const res = await chai.request(server).keepOpen().get('/v1/groups').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("test-group-1");
    });

    it('it should POST a list of group', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const groups = [{ _id: "test-group-3" },
        { _id: "test-group-4" }];
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(groups)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.groups[0]._id.should.be.eql(groups[0]._id);
        res.body.groups[1]._id.should.be.eql(groups[1]._id);
    });

    it('it should POST only not existing groups from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        let groups = [{ _id: "test-group-1" },
                        { _id: "test-group-3" },
                        { _id: "test-group-4" }];
        await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(groups);
        groups = [{ _id: "test-group-1" },
                        { _id: "test-group-2" },
                        { _id: "test-group-3" },
                        { _id: "test-group-4" },
                        { _id: "test-group-5" }];
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(groups);
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.groups.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
        res.body.errors[0].should.contain(groups[0]._id);
        res.body.errors[1].should.contain(groups[2]._id);
        res.body.errors[2].should.contain(groups[3]._id);
        res.body.groups[0]._id.should.be.eql(groups[1]._id);
        res.body.groups[1]._id.should.be.eql(groups[4]._id);
    });

    it('it should POST a group with tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-2", user);
        const group = { _id: "test-group-2", tags: [tag] };
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(group._id);
        res.body.tags.length.should.be.eql(1);
    });  

    it('it should POST a group with users _id', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user1 = await factory.createUser("user-test-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("user-test-2", "test-password-2", UserRoles.provider);
        
        const group = { _id: "test-group-2", users: [user1._id.toString(),user2._id.toString()] };
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(group._id);
        res.body.users.length.should.be.eql(2);        
        res.body.users[0].should.be.eql(user1._id.toString());   
        res.body.users[1].should.be.eql(user2._id.toString());
    });  
    
    it('it should POST a group with users username', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user1 = await factory.createUser("user-test-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("user-test-2", "test-password-2", UserRoles.provider);
        
        const group = { _id: "test-group-2", users: [user1.username.toString(),user2.username.toString()] };
        const res = await chai.request(server).keepOpen().post('/v1/groups').set("Authorization", await factory.getUserToken(user)).send(group);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql(group._id);
        res.body.users.length.should.be.eql(2);        
        res.body.users[0].should.be.eql(user1._id.toString());   
        res.body.users[1].should.be.eql(user2._id.toString());
    });  
});

// Test the /POST file route
describe('/POST group from file', () => {
    it('it should POST groups from file csv with user by _id', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);        
        const testFile = './test/test/Group_test.csv';        
        
        const res = await chai.request(server).keepOpen().post('/v1/groups/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('groups');
        res.body.groups.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(0);        
        res.body.groups[0].should.have.property('_id');
        res.body.groups[1].should.have.property('_id');
        res.body.groups[2].should.have.property('_id');
        res.body.groups[0]._id.should.be.eql("group_test_1");
        res.body.groups[1]._id.should.be.eql("group_test_2");        
        res.body.groups[2]._id.should.be.eql("group_test_3");
    });  
    
    it('it should POST groups from file csv with user by username', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user1 = await factory.createUser("user_test_1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("user_test_2", "test-password-2", UserRoles.provider);        
        const testFile = './test/test/Group_test_username.csv';        
        
        const res = await chai.request(server).keepOpen().post('/v1/groups/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('groups');
        res.body.groups.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(0);        
        res.body.groups[0]._id.should.be.eql("group_test_1");
        res.body.groups[1]._id.should.be.eql("group_test_2");        
        res.body.groups[2]._id.should.be.eql("group_test_3");
        res.body.groups[0].users.length.should.be.eql(2);
        res.body.groups[1].users.length.should.be.eql(1);
        res.body.groups[2].users.length.should.be.eql(0);
        res.body.groups[0].users[0].should.be.eql(user1._id.toString());
        res.body.groups[0].users[1].should.be.eql(user2._id.toString());
        res.body.groups[1].users[0].should.be.eql(user1._id.toString());
    });   
});

// Test the /DELETE route
describe('/DELETE group', () => {
    it('it should DELETE a group', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = await factory.createGroup("test-group-1", user, [], null, null, null);
        const groups_before = await before.Group.find();
        groups_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const groups_after = await before.Group.find();
        groups_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake group', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const group = await factory.createGroup("test-group-2", user, [], null, null, null);
        const groups_before = await before.Group.find();
        groups_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/groups/fake_group').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const groups_after = await before.Group.find();
        groups_after.length.should.be.eql(1);
    });

     
});

// Test the /PUT route
describe('/PUT group', () => {
    it('it should PUT a group _id', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2], null, null, null);
        const modification = { _id:"new-test-group-1" };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-group-1");
    });

    it('it should PUT a group to add a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2], null, null, null);
        const modification = { tags: { add: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a group _id and add a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2], null, null, null);
        const modification = { _id:"new-test-group-1",tags: { add: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-group-1");
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a group to remove a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2, tag_3], null, null, null);
        const modification = { tags: { remove: [tag_2._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(2);
    });

    it('it should PUT a group to add and remove tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const tag_4 = await factory.createTag("test-tag-4", user);
        const tag_5 = await factory.createTag("test-tag-5", user);
        const tag_6 = await factory.createTag("test-tag-6", user);
        const tag_7 = await factory.createTag("test-tag-7", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2, tag_3, tag_4], null, null, null);
        const modification = { tags: { remove: [tag_2._id, tag_3._id], add: [tag_5._id, tag_6._id, tag_7._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(5);
    });

    it('it should not PUT a group adding a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2], null, null, null);
        const modification = { tags: { add: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be added to the list not found');
    });

    it('it should not PUT a group removing a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2], null, null, null);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be removed from list not found');
    });

    it('it should not PUT a fake group', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2], null, null, null);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/fake-group').set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a group with a wrong field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const group = await factory.createGroup("test-group-1", user, [tag_1, tag_2], null, null, null);
        const modification = { tags: { remove: [tag_2._id] }, fakefield: "fake-value" };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Request field cannot be updated ');
    });

    it('it should PUT a group to add a user by _id', async () => {
        const user = await factory.createUser("test-username-0", "test-password-0", UserRoles.provider);
        const group = await factory.createGroup("test-group-1", user, [], null, null, null);
        const user1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const user3 = await factory.createUser("test-username-3", "test-password-3", UserRoles.provider);
           
        const modification = { users: { add: [user1._id, user2._id, user3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.users.length.should.be.eql(3);
        res.body.users[0].should.be.eql(user1._id.toString());
        res.body.users[1].should.be.eql(user2._id.toString());
        res.body.users[2].should.be.eql(user3._id.toString());
      });
    
      it('it should PUT a group to remove a user by _id', async () => {
        const user = await factory.createUser("test-username-0", "test-password-0", UserRoles.provider);
        const user1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const user3 = await factory.createUser("test-username-3", "test-password-3", UserRoles.provider);        
        const group = await factory.createGroup("test-group-1", user, [], null, null, null,[user1._id,user2._id,user3._id]);
        const modification = { users: { remove: [user2._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.users.length.should.be.eql(2);
        res.body.users[0].should.be.eql(user1._id.toString());
        res.body.users[1].should.be.eql(user3._id.toString());
      });

      it('it should PUT a group to add a user by username', async () => {
        const user = await factory.createUser("test-username-0", "test-password-0", UserRoles.provider);
        const group = await factory.createGroup("test-group-1", user, [], null, null, null);
        const user1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const user3 = await factory.createUser("test-username-3", "test-password-3", UserRoles.provider);
           
        const modification = { users: { add: [user1.username, user2.username, user3.username] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.users.length.should.be.eql(3);
        res.body.users[0].should.be.eql(user1._id.toString());
        res.body.users[1].should.be.eql(user2._id.toString());
        res.body.users[2].should.be.eql(user3._id.toString());
      });
    
      it('it should PUT a group to remove a user by username', async () => {
        const user = await factory.createUser("test-username-0", "test-password-0", UserRoles.provider);
        const user1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const user3 = await factory.createUser("test-username-3", "test-password-3", UserRoles.provider);        
        const group = await factory.createGroup("test-group-1", user, [], null, null, null,[user1._id,user2._id,user3._id]);
        const modification = { users: { remove: [user2.username] } };
        const res = await chai.request(server).keepOpen().put('/v1/groups/' + group._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.users.length.should.be.eql(2);
        res.body.users[0].should.be.eql(user1._id.toString());
        res.body.users[1].should.be.eql(user3._id.toString());
      });
});
