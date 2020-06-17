

process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const Authentication = require('../security/authentication.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const UserRoles = require('../types/userRoles.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const errors = require('../commons/errors.js');
chai.use(chaiHttp);

describe('Field view with mask', () => {
    it('it should see all fields of a list of measurements without fieldmask', async () => {      
const admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/').set("Authorization", await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res.body.docs[0].should.include.keys("samples");
        res.body.docs[0].should.include.keys("startDate");
        res.body.docs[0].should.include.keys("device");
        res.body.docs[0].should.include.keys("thing");
        res.body.docs[0].should.not.include.keys("owner");
    });

    it('it should see just fields defined in fieldmask of a list of measurement', async () => {      
        const admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples', 'startDate'], [], [], [], admin)
        const modification = { fieldmask: 'fieldmask-test-1' };
        let res = await chai.request(server).keepOpen().put('/v1/users/' + analyst._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res = await chai.request(server).keepOpen().get('/v1/measurements/').set("Authorization", await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res.body.docs[0].should.include.keys("samples");
        res.body.docs[0].should.include.keys("startDate");
        res.body.docs[0].should.not.include.keys("device");
        res.body.docs[0].should.not.include.keys("thing");
        res.body.docs[0].should.not.include.keys("owner");
    });

    it('it should see all fields of a single measurement without fieldmask', async () => {      
        const admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.should.include.keys("samples");
        res.body.should.include.keys("startDate");
        res.body.should.include.keys("device");
        res.body.should.include.keys("thing");
        res.body.should.not.include.keys("owner");
    });

    it('it should see just fields defined in fieldmask of a single measurement', async () => {      
        const admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1), null, null, null, VisibilityTypes.public);
        const fieldmask = await factory.createFieldmask("fieldmask-test-1", [], [], [], ['samples', 'startDate'], [], [], [], admin)
        const modification = { fieldmask: 'fieldmask-test-1' };
        let res = await chai.request(server).keepOpen().put('/v1/users/' + analyst._id).set("Authorization", await factory.getUserToken(admin)).send(modification);
        res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id).set("Authorization", await factory.getUserToken(analyst));
        res.should.have.status(200);
        res.body.should.include.keys("samples");
        res.body.should.include.keys("startDate");
        res.body.should.not.include.keys("device");
        res.body.should.not.include.keys("thing");
        res.body.should.not.include.keys("owner");
    });
});
