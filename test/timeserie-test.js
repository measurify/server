process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const database = require('../database.js');
const server = require('../server.js');
const should = chai.should();
const factory = require('../commons/factory.js');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

// Test the /GET route
describe('/GET time samples', () => {
    it('it should GET the timeserie of a measurement', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement01 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const measurement02 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample04 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample05 = await factory.createTimesample(owner, [1], null, measurement01);
        const res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement02._id + '/timeserie').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific timesample of a timeserie', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement);
        const res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id + '/timeserie/' + timesample02._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(timesample02._id.toString());
    });

    it('it should not GET a timesample of a different timeserie', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement01 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const measurement02 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement02);
        const res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement01._id + '/timeserie/' + timesample02._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should COUNT the timesamples of a timeserie', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement01 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const measurement02 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample04 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample05 = await factory.createTimesample(owner, [1], null, measurement01);
        const res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement02._id + '/timeserie/count').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.size.should.be.eql(2);
    });

    it('it should not GET timesamples of a fake measurement', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement);
        const res = await chai.request(server).keepOpen().get('/v1/measurements/fake-measurement/timeserie').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should GET a subset of timesample froma filtered timeseries', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement01 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const measurement02 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const date = new Date();
        const timesample01 = await factory.createTimesample(owner, [1], factory.addDays(date, - 8), measurement01);
        const timesample02 = await factory.createTimesample(owner, [1], factory.addDays(date, - 7), measurement01);
        const timesample03 = await factory.createTimesample(owner, [1], factory.addDays(date, - 8), measurement01);
        const timesample04 = await factory.createTimesample(owner, [1], factory.addDays(date, - 3), measurement01);
        const timesample05 = await factory.createTimesample(owner, [1], factory.addDays(date, - 3), measurement01);
        const timesample06 = await factory.createTimesample(owner, [1], factory.addDays(date, - 1), measurement01);
        const timesample07 = await factory.createTimesample(owner, [1], factory.addDays(date, - 3), measurement02);
        const timesample08 = await factory.createTimesample(owner, [1], factory.addDays(date, - 1), measurement02);
        const timesample09 = await factory.createTimesample(owner, [1], factory.addDays(date, - 5), measurement02);
        const date_after = factory.addDays(date, - 4);
        const date_before = factory.addDays(date, - 2);
        filter = JSON.stringify({ timestamp: { $gte: date_after, $lt: date_before } });
        const res = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement01._id + '/timeserie?filter=' + filter).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });
});

// Test the /POST route
describe('/POST feature', () => {
    it('it should not POST a timesample without timestamp field', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [1] }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesample)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: timestamp');
    });

    it('it should not POST a timesample without values field', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { timestamp: Date.now()}
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesample)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('ValidationError: values');
    });

    it('it should POST a timesample', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [1], timestamp: Date.now()}
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesample)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('values');
    });

    it('it should POST a list of timesamples', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = { values: [1], timestamp: Date.now()};
        const timesample02 = { values: [1], timestamp: Date.now()};
        const timesample03 = { values: [1], timestamp: Date.now()};
        const timesample04 = { values: [1], timestamp: Date.now()};
        const timesamples  = [ timesample01, timesample02, timesample03, timesample04 ];
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesamples)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(4);
    });

    it('it should POST only correct timesamples of a list', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = { values: [1], timestamp: Date.now()};
        const timesample02 = { timestamp: Date.now()};
        const timesample03 = { values: [1], timestamp: Date.now()};
        const timesample04 = { values: [1], };
        const timesample05 = { values: [1], };
        const timesamples  = [ timesample01, timesample02, timesample03, timesample04, timesample05 ];
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesamples)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
    });

    it('it should not POST a timesample non coherent with the measurement feature', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner,
            [ { "name": "a", "unit": "u", "type": "number", "dimension": 0 },
              { "name": "b", "unit": "u", "type": "number", "dimension": 1 } ]
        );
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [0], timestamp: Date.now()}
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesample)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('No match between timesample values size and feature items size');
    });
});

// Test the /DELETE route
describe('/DELETE feature', () => {
    it('it should DELETE a timeseries', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample04 = await factory.createTimesample(owner, [1], null, measurement);
        const timesample05 = await factory.createTimesample(owner, [1], null, measurement);
        const timesamples_before = await before.Timesample.find();
        timesamples_before.length.should.be.eql(5);
        const res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const timesamples_after = await before.Timesample.find();
        timesamples_after.length.should.be.eql(0);
    });

    it('it should DELETE timesample of just one timeseries', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement01 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const measurement02 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample04 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample05 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesamples_before = await before.Timesample.find();
        timesamples_before.length.should.be.eql(5);
        const res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement01._id + '/timeserie').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const timesamples_after = await before.Timesample.find();
        timesamples_after.length.should.be.eql(2);
    });

    it('it should DELETE a timesample', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement01 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const measurement02 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample04 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample05 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesamples_before = await before.Timesample.find();
        timesamples_before.length.should.be.eql(5);
        res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement02._id + '/timeserie/' + timesample03._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const timesamples_after = await before.Timesample.find();
        timesamples_after.length.should.be.eql(4);
    });

    it('it should not DELETE a timesample of a different timeseries', async () => {      
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement01 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const measurement02 = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample02 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample03 = await factory.createTimesample(owner, [1], null, measurement02);
        const timesample04 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesample05 = await factory.createTimesample(owner, [1], null, measurement01);
        const timesamples_before = await before.Timesample.find();
        res = await chai.request(server).keepOpen().delete('/v1/measurements/' + measurement01._id + '/timeserie/' + timesample03._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});