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
const RoleCrudTypes = require('../types/roleCrudTypes.js');

// Test the /GET route
describe('/GET role', () => {
    it('it should GET all the default roles', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const res = await chai.request(server).keepOpen().get('/v1/roles').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);        
    });

    it('it should GET all the default roles + custom roles', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);
        const role2=await factory.createRole("test-role-2", crud2);    
        const res = await chai.request(server).keepOpen().get('/v1/roles').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(6);     
    });

    it('it should GET a specific role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const role1= await factory.createRole("test-role-1", crud1);
        const res = await chai.request(server).keepOpen().get('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(role1._id.toString());
    });

    it('it should not GET a fake role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const res = await chai.request(server).keepOpen().get('/v1/roles/fake-role').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST role', () => {
    it('it should not POST a role without _id field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const role = {}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
    });

    it('it should not POST a role without default field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const role = {_id:"test-role-1"}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
    });

    it('it should not POST a role without default create field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const role = {_id:"test-role-1",default:{}}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: default: Role validation failed: default doesn\'t have create action');
    });

    it('it should not POST a role without default read field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const role = {_id:"test-role-1",default:{create:true}}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: default: Role validation failed: default doesn\'t have read action');
    });

    it('it should not POST a role without default update field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const role = {_id:"test-role-1",default:{create:true,read:"all"}}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: default: Role validation failed: default doesn\'t have update action');
    });

    it('it should not POST a role without default delete field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const role = {_id:"test-role-1",default:{create:true,read:"all",update:"all"}}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: default: Role validation failed: default doesn\'t have delete action');
    });

    it('it should not POST a role with a fake default action', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const role = { _id: "test-role-1", default: "fake-default" };
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: default: Cast to Embedded failed for value "fake-default" (type string) at path "default"');
    });
    
    it('it should POST a role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const role = { _id: "test-role-1" ,default:crud1}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(role._id);
    });

    it('it should not POST a role with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const role = { _id: "test-role-1" ,default:crud1};
        await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key');
    });

    it('it should GET the role posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const role = { _id: "test-role-1" ,default:crud1};
        await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        const res = await chai.request(server).keepOpen().get('/v1/roles').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);       
    });

    it('it should POST a list of role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);        
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const roles = [{ _id: "test-role-3" ,default:crud1},
        { _id: "test-role-4",default:crud1 }];
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(roles)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.roles.length.should.be.eql(2);  
        res.body.roles[0]._id.should.be.eql(roles[0]._id);
        res.body.roles[1]._id.should.be.eql(roles[1]._id);
    });

    it('it should POST only not existing roles from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        let roles = [{ _id: "test-role-1",default:crud1 },
                        { _id: "test-role-3",default:crud1 },
                        { _id: "test-role-4" ,default:crud1}];
        await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(roles);
        roles = [{ _id: "test-role-1",default:crud1 },
                        { _id: "test-role-2",default:crud1 },
                        { _id: "test-role-3",default:crud1 },
                        { _id: "test-role-4",default:crud1 },
                        { _id: "test-role-5",default:crud1 }];
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(roles);
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.roles.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
        res.body.errors[0].should.contain(roles[0]._id);
        res.body.errors[1].should.contain(roles[2]._id);
        res.body.errors[2].should.contain(roles[3]._id);
        res.body.roles[0]._id.should.be.eql(roles[1]._id);
        res.body.roles[1]._id.should.be.eql(roles[4]._id);
    });

    it('it should POST a role with action', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(true,RoleCrudTypes.none,RoleCrudTypes.none,RoleCrudTypes.none);
        const action= {entity:"Feature",crud:crud2};
        const role = { _id: "test-role-1" ,default:crud1,actions:[action]}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(role._id);
    });

    it('it should POST a role with multiple action', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(true,RoleCrudTypes.none,RoleCrudTypes.none,RoleCrudTypes.none);
        const action1= {entity:"Feature",crud:crud2};
        const action2= {entity:"Thing",crud:crud2};
        const role = { _id: "test-role-1" ,default:crud1,actions:[action1,action2]}
        const res = await chai.request(server).keepOpen().post('/v1/roles').set("Authorization", await factory.getUserToken(user)).send(role);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(role._id);
    });
});
 /*
// Test the /POST file route
describe('/POST thing from file', () => {
    it('it should POST things from file csv', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);        
        const testFile = './test/dummies/Thing_test.csv';        
        
        const res = await chai.request(server).keepOpen().post('/v1/things/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('things');
        res.body.things.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(0);        
        res.body.things[0].should.have.property('_id');
        res.body.things[1].should.have.property('_id');
        res.body.things[2].should.have.property('_id');
        res.body.things[0]._id.should.be.eql("thing_test_1");
        res.body.things[1]._id.should.be.eql("thing_test_2");        
        res.body.things[2]._id.should.be.eql("thing_test_3");
    });  
});
 */
// Test the /DELETE route
describe('/DELETE role', () => {
    it('it should DELETE a role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);
        const role2=await factory.createRole("test-role-2", crud2);            
        const roles_before = await before.Role.find();
        roles_before.length.should.be.eql(6);
        const res = await chai.request(server).keepOpen().delete('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const roles_after = await before.Role.find();
        roles_after.length.should.be.eql(5);
    });

    it('it should not DELETE a fake role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);
        const role2=await factory.createRole("test-role-2", crud2);
        const roles_before = await before.Role.find();
        roles_before.length.should.be.eql(6);
        const res = await chai.request(server).keepOpen().delete('/v1/roles/fake_role').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const roles_after = await before.Role.find();
        roles_after.length.should.be.eql(6);
    });

    it('it should not DELETE a role already used in a user', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const role1= await factory.createRole("test-role-1", crud1);        
        const user2 = await factory.createUser("test-username-2", "test-password-2", role1._id);
        const roles_before = await before.Role.find();
        roles_before.length.should.be.eql(5);
        const res = await chai.request(server).keepOpen().delete('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const roles_after = await before.Role.find();
        roles_after.length.should.be.eql(5);
    });    
});

// Test the /PUT route
describe('/PUT role', () => {
    /*
    it('it should PUT a thing _id', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const thing = await factory.createThing("test-thing-1", user, [tag_1, tag_2]);
        const modification = { _id:"new-test-thing-1" };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-thing-1");
    });
    
    it('it should not PUT a thing _id used in a measurement', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const request = { _id:"new-test-thing-2" };
        const res = await chai.request(server).keepOpen().put('/v1/things/' + thing._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
    });
    */
    it('it should PUT a role to add an action', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);
        const modification = { actions: { add: [{entity:"Feature",crud:crud3}] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.actions.length.should.be.eql(1);
    });

    it('it should PUT a role to add multiple actions', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);              
        const modification = { actions: { add: [{entity:"Feature",crud:crud3},{entity:"Thing",crud:crud2}] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);               
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.actions.length.should.be.eql(2);
    });

    it('it should PUT a role to remove an action', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const action1= {entity:"Feature",crud:crud3};
        const action2= {entity:"Thing",crud:crud2};
        const role1= await factory.createRole("test-role-1", crud1,[action1,action2]);
        const modification = { actions: { remove: [action1.entity] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.actions.length.should.be.eql(1);
        res.body.actions[0].entity.should.be.eql(action2.entity);
    });

    it('it should PUT a role to remove multiple actions', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const action1= {entity:"Feature",crud:crud3};
        const action2= {entity:"Thing",crud:crud2};
        const role1= await factory.createRole("test-role-1", crud1,[action1,action2]);
        const modification = { actions: { remove: [action1.entity,action2.entity] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.actions.length.should.be.eql(0);
    });

    it('it should PUT a role to add and remove actions', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const action1= {entity:"Feature",crud:crud3};
        const action2= {entity:"Thing",crud:crud2};        
        const role1= await factory.createRole("test-role-1", crud1,[action1,action2]);
        const modification = { actions: { add: [{entity:"Experiment",crud:crud3}],remove: [action1.entity,action2.entity] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.actions.length.should.be.eql(1);
    });

    it('it should not PUT a role adding a fake-entity', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const action1= {entity:"Feature",crud:crud3};
        const action2= {entity:"Thing",crud:crud2};        
        const role1= await factory.createRole("test-role-1", crud1,[action1,action2]);
        const modification = { actions: { add: [{entity:"fake-entity",crud:crud3}],remove: [action1.entity,action2.entity] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);        
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain(' Role validation failed: fake-entity is not a valid entity name');
    });

    it('it should not PUT a role removing a fake role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const action1= {entity:"Feature",crud:crud3};
        const action2= {entity:"Thing",crud:crud2};        
        const role1= await factory.createRole("test-role-1", crud1,[action1,action2]);
        const modification = { actions: { remove: ["fake_role"] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Embedded resource to be removed from list not found: fake_role');
    });

    it('it should not PUT a fake role', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const action1= {entity:"Feature",crud:crud3};
        const action2= {entity:"Thing",crud:crud2};        
        const role1= await factory.createRole("test-role-1", crud1,[action1,action2]);
        const modification = { actions: { remove: ["fake_role"] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/fake-role').set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a role with a wrong field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const action1= {entity:"Feature",crud:crud3};
        const action2= {entity:"Thing",crud:crud2};        
        const role1= await factory.createRole("test-role-1", crud1,[action1,action2]);
        const modification = { actions: { fakefield: ["fake_role"] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Cannot manage the field (actions)');
    });

    it('it should PUT a role to modify default', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);
        const modification = { default: crud3  };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);                       
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.default.should.be.eql(crud3);
    });

    it('it should not PUT a role with an identical default', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);
        const modification = { default: crud1  };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);   
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Same default field');    
    });

    it('it should PUT a role to add an action', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const crud1 = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crud2 = await factory.createCrud(false,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned);
        const crud3 = await factory.createCrud(false,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const role1= await factory.createRole("test-role-1", crud1);
        const modification = { actions: { add: [{entity:"Feature",crud:crud3}] } };
        const res = await chai.request(server).keepOpen().put('/v1/roles/' + role1._id).set("Authorization", await factory.getUserToken(user)).send(modification);        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.actions.length.should.be.eql(1);
    });
});
