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
describe('/GET fieldmask', () => {
    it('it should GET all the fieldmasks as admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask1 = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const fieldmask2 = await factory.createFieldmask("fieldmaask-test-2", [], [], [], ['samples'], [], [], [], admin);
        const fieldmask3 = await factory.createFieldmask("fieldmaask-test-3", [], [], [], ['samples'], [], [], [], admin);
        const res = await chai.request(server).keepOpen().get('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET fieldmasks as non admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const fieldmask1 = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const fieldmask2 = await factory.createFieldmask("fieldmaask-test-2", [], [], [], ['samples'], [], [], [], admin);
        const fieldmask3 = await factory.createFieldmask("fieldmaask-test-3", [], [], [], ['samples'], [], [], [], admin);
        const res = await chai.request(server).keepOpen().get('/v1/fieldmasks').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should GET a specific fieldmask as admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const res = await chai.request(server).keepOpen().get('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(fieldmask._id.toString());
    });

    it('it should GET a specific fieldmask as non admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const res = await chai.request(server).keepOpen().get('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(fieldmask._id.toString());
    });

    it('it should not GET a fake fieldmask', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const res = await chai.request(server).keepOpen().get('/v1/fieldmasks/fake-mask').set("Authorization", await factory.getUserToken(admin));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST fieldmasks', () => {    
    it('it should not POST a fieldmask without id field', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = { measurement_fields: ['samples'] };
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmask);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should not POST a fieldmask without any property', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = { _id: 'test-fieldmask' };
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmask);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Fieldschema validation failed: supply at least one not empty property');
    });

    it('it should not POST a fieldmask with a property with a fake value', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = { _id: 'test-fieldmask', measurement_fields: ['fake-value']};
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmask);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Fieldschema validation failed: supply valid fields');
    });

    it('it should POST a fieldmask', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = { _id: 'test-fieldmask', measurement_fields: ['samples']};
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmask);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(fieldmask._id);
    });

    it('it should not POST a fieldmask as non admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const fieldmask = { _id: 'test-fieldmask', measurement_fields: ['samples']};
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(user)).send(fieldmask);
        res.should.have.status(errors.admin_restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.admin_restricted_access.message);
    });

    it('it should not POST a fieldmask with already existant _id field', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = { _id: 'test-fieldmask', measurement_fields: ['samples']};
        await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmask);
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmask);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key');
    });

    it('it should POST a list of fieldmask', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin); 
        const fieldmasks = [ { _id: 'test-fieldmask-1', measurement_fields: ['samples'] },
                             { _id: 'test-fieldmask-2', measurement_fields: ['samples'] },
                             { _id: 'test-fieldmask-3', measurement_fields: ['samples'] } ];
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmasks);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.fieldmasks.length.should.be.eql(3);
    });

    it('it should POST only correct fieldmask from a list', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin); 
        const fieldmasks = [ { _id: 'test-fieldmask-1', measurement_fields: ['samples'] },
                            { _id: 'test-fieldmask-2' },
                            { _id: 'test-fieldmask-3', measurement_fields: ['fake-field'] },
                            { _id: 'test-fieldmask-4', measurement_fields: ['samples'] },
                            { _id: 'test-fieldmask-5', measurement_fields: ['samples'] },
                            { _id: 'test-fieldmask-6', measurement_fields: ['samples'] },
                            { _id: 'test-fieldmask-4', measurement_fields: ['samples'] } ];
        const res = await chai.request(server).keepOpen().post('/v1/fieldmasks').set("Authorization", await factory.getUserToken(admin)).send(fieldmasks);
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.fieldmasks.length.should.be.eql(4);
        res.body.errors.length.should.be.eql(3);
    });
});

// Test the /DELETE route
describe('/DELETE fieldmasks', () => {
    it('it should DELETE a fieldmask', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const fieldmasks_before = await before.Fieldmask.find();
        fieldmasks_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const fieldmasks_after = await before.Fieldmask.find();
        fieldmasks_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake fieldmask', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const fieldmasks_before = await before.Fieldmask.find();
        fieldmasks_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/fieldmasks/fake_fieldmask').set("Authorization", await factory.getUserToken(admin));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const fieldmasks_after = await before.Fieldmask.find();
        fieldmasks_after.length.should.be.eql(1);
    });

    it('it should not DELETE a fieldmask as a non admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const fieldmasks_before = await before.Fieldmask.find();
        fieldmasks_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.admin_restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.admin_restricted_access.message);
        const fieldmasks_after = await before.Fieldmask.find();
        fieldmasks_after.length.should.be.eql(1);
    });

    it('it should not DELETE a fieldmask already used in a thing', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst, fieldmask);
        const fieldmasks_before = await before.Fieldmask.find();
        fieldmasks_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const fieldmasks_after = await before.Fieldmask.find();
        fieldmasks_after.length.should.be.eql(1);
    });
});

// Test the /PUT route
describe('/PUT fieldmasks', () => {
    // it('it should PUT a fieldmask _id', async () => {
    //     const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
    //     const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples'], [], [], [], admin)
    //     const modification = { _id:"new-fieldmask-test-1" };
    //     const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
    //     res.should.have.status(200);
    //     res.body.should.be.a('object');
    //     res.body.should.have.property('_id');
    //     res.body._id.should.be.eql("new-fieldmask-test-1");
    // });

    it('it should PUT a fieldmasks to add a field', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples'], [], [], [], admin)
        const modification = { measurement_fields: { add: ['startDate'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('measurement_fields');
        res.body.measurement_fields.length.should.be.eql(2);
    });

    // it('it should PUT a fieldmask _id and add a field', async () => {
    //     const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
    //     const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples'], [], [], [], admin)
    //     const modification = { _id:"new-fieldmask-test-1",measurement_fields: { add: ['startDate'] }  };
    //     const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
    //     res.should.have.status(200);
    //     res.body.should.be.a('object');
    //     res.body.should.have.property('_id');
    //     res.body._id.should.be.eql("new-fieldmask-test-1");
    //     res.body.should.have.property('measurement_fields');
    //     res.body.measurement_fields.length.should.be.eql(2);
    // });

    it('it should PUT a fieldmasks to remove a field', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples', 'startDate'], [], [], [], admin)
        const modification = { measurement_fields: { remove: ['samples'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('measurement_fields');
        res.body.measurement_fields.length.should.be.eql(1);
    });

    it('it should not PUT a fieldmasks to add a fake field', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples'], [], [], [], admin)
        const modification = { measurement_fields: { add: ['fake-field'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Field to be added to the list not found');
    });

    it('it should not PUT a fieldmasks to remove a fake field', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples', 'startDate'], [], [], [], admin)
        const modification = { measurement_fields: { remove: ['fake-field'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.put_request_error.message);
        res.body.details.should.contain('Field to be removed from list not found');
    });

    it('it should PUT a fieldmasks to add and remove fields', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples', 'endDate', 'startDate'], [], [], [], admin)
        const modification = { measurement_fields: { remove: ['startDate'], add:['thing', 'device'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('measurement_fields');
        res.body.measurement_fields.length.should.be.eql(4);
    });

    it('it should not PUT a fieldmasks to add or remove fields from a fake resource', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples', 'startDate'], [], [], [], admin)
        const modification = { fakefield: { remove: ['samples'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(errors.incorrect_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.incorrect_info.message);
    });

    it('it should not PUT a fake fieldmasks', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples', 'endDate', 'startDate'], [], [], [], admin)
        const modification = { measurement_fields: { remove: ['startDate'], add:['thing', 'device'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/fake-fieldmask').set("Authorization", await factory.getUserToken(admin)).send(modification);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should not PUT a fieldmask as a non admin', async () => {      
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const user = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const fieldmask = await factory.createFieldmask("fieldmaask-test-1", [], [], [], ['samples'], [], [], [], admin);
        const modification = { measurement_fields: { remove: ['startDate'], add:['thing', 'device'] } };
        const res = await chai.request(server).keepOpen().put('/v1/fieldmasks/' + fieldmask._id).set("Authorization", await factory.getUserToken(user)).send(modification);
        res.should.have.status(errors.admin_restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.admin_restricted_access.message);
    });
});
