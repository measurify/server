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

// Test the /GET route
describe('/GET scripts', () => {
    it('it should GET all the script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createScript("test-script-2", user, "test-code-2", []);
        await factory.createScript("test-script-1", user, "test-code-1", []);
        const res = await chai.request(server).keepOpen().get('/v1/scripts').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = await factory.createScript("test-script-1", user, "test-code-2", []);
        const res = await chai.request(server).keepOpen().get('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(script._id.toString());
    });

    it('it should not GET a fake script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/scripts/fake-script').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST script', () => {
    it('it should not POST a script without _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = {}
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(script)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should not POST a script without code field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = { _id: "script-id" }
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(script)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply the code');
    });

    it('it should not POST a script with a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = { _id: "test-script-a", code: "test-code-1", tags: ["fake-tag"] };
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(script);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should POST a script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = { _id: "test-script-1", code: "test-code-1" };
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(script)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(script._id);
    });

    it('it should not POST a script with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = { _id: "test-script-1", code: "test-code-1" };
        await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(script)
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(script)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('the _id is already used');
    });

    it('it should POST a list of script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const scripts = [{ _id: "test-script-1", code: "test-code-1" },
                         { _id: "test-script-2", code: "test-code-2" } ];
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(scripts);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.scripts[0]._id.should.be.eql(scripts[0]._id);
        res.body.scripts[1]._id.should.be.eql(scripts[1]._id);
    });

    it('it should POST only not existing scripts from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        let scripts = [{ _id: "test-script-1", code: "test-code-1" },
                       { _id: "test-script-2", code: "test-code-2" } ];
        await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(scripts)
        scripts = [{ _id: "test-script-3", code: "test-code-3" },
                         { _id: "test-script-4", code: "test-code-4" },
                         { _id: "test-script-1", code: "test-code-1" },
                         { _id: "test-script-5", code: "test-code-5" },
                         { _id: "test-script-2", code: "test-code-2" } ];
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(scripts)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.scripts.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain(scripts[2]._id);
        res.body.errors[1].should.contain(scripts[4]._id);
        res.body.scripts[0]._id.should.contain(scripts[0]._id);
        res.body.scripts[1]._id.should.be.eql(scripts[1]._id);
        res.body.scripts[2]._id.should.be.eql(scripts[3]._id);
    });

    it('it should POST a script with tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-2", user);
        const script = { _id: "test-script-1", code: "test-code-1", tags: [tag] };
        const res = await chai.request(server).keepOpen().post('/v1/scripts').set("Authorization", await factory.getUserToken(user)).send(script)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(script._id);
        res.body.tags.length.should.be.eql(1);
    });
});

// Test the /DELETE route
describe('/DELETE script', () => {
    it('it should DELETE a script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = await factory.createScript("test-script-1", user, "test-code-1", []);
        const script_before = await before.Script.find();
        script_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const scripts_after = await before.Script.find();
        scripts_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = await factory.createScript("test-script-1", user, "test-code-1", []);
        const script_before = await before.Script.find();
        script_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/scripts/fake_script').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const scripts_after = await before.Script.find();
        scripts_after.length.should.be.eql(1);
    });

    it('it should not DELETE a script already used in a device', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = await factory.createScript("test-script-1", user, "test-code-1", []);
        const feature = await factory.createFeature("test-feature-1", user);
        const device = await factory.createDevice("test-device-1", user, [feature], [], [script]);
        const script_before = await before.Script.find();
        script_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const scripts_after = await before.Script.find();
        scripts_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT script', () => {
    it('it should PUT a script to modify code', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const script = await factory.createScript("test-script-1", user, "test-code-1", []);
        const modification = { code: "this is the new code"}
        const res = await chai.request(server).keepOpen().put('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.code.should.be.eql("this is the new code");
    });

    it('it should PUT a script to add a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const script = await factory.createScript("test-script-1", user, "test-code-1", [tag_1, tag_2]);
        const modification = { tags: { add: [tag_3._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a script to remove a tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const script = await factory.createScript("test-script-1", user, "test-code-1", [tag_1, tag_2, tag_3]);
        const modification = { tags: { remove: [tag_2._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(2);
    });

    it('it should PUT a script to add and remove tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const tag_3 = await factory.createTag("test-tag-3", user);
        const tag_4 = await factory.createTag("test-tag-4", user);
        const tag_5 = await factory.createTag("test-tag-5", user);
        const tag_6 = await factory.createTag("test-tag-6", user);
        const tag_7 = await factory.createTag("test-tag-7", user);
        const script = await factory.createScript("test-script-1", user, "test-code-1", [tag_1, tag_2, tag_3, tag_4]);
        const modification = { tags: { remove: [tag_2._id, tag_3._id], add: [tag_5._id, tag_6._id, tag_7._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.tags.length.should.be.eql(5);
    });

    it('it should not PUT a script adding a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const script = await factory.createScript("test-script-1", user, "test-code-1", [tag_1, tag_2]);
        const modification = { tags: { add: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be added to the list not found');
    });

    it('it should not PUT a script removing a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const script = await factory.createScript("test-script-1", user, "test-code-1", [tag_1, tag_2]);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Resource to be removed from list not found');
    });

    it('it should not PUT a fake script', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const script = await factory.createScript("test-script-1", user, "test-code-1", [tag_1, tag_2]);
        const modification = { tags: { remove: ["fake_tag"] } };
        const res = await chai.request(server).keepOpen().put('/v1/scripts/fake-script').set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a script with a wrong field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user);
        const tag_2 = await factory.createTag("test-tag-2", user);
        const script = await factory.createScript("test-script-1", user, "test-code-1", [tag_1, tag_2]);
        const modification = { fakefield: "fake-value", tags: { remove: [tag_1._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/scripts/' + script._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Request field cannot be updated ');
    });
});
