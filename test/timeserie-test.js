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
const ItemTypes = require("../types/itemTypes.js");

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
describe('/POST time samples', () => {
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
        const timesample = { timestamp: Date.now() }
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
        const timesample = { values: [1], timestamp: Date.now() }
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
        const timesample01 = { values: [1], timestamp: Date.now() };
        const timesample02 = { values: [1], timestamp: Date.now() };
        const timesample03 = { values: [1], timestamp: Date.now() };
        const timesample04 = { values: [1], timestamp: Date.now() };
        const timesamples = [timesample01, timesample02, timesample03, timesample04];
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesamples)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(4);
    });

    it('it should POST a list of timesamples in csv from body', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const body= {
            body: "timestamp,values\n2022-12-21T14:15:27.976Z,[10]\n2022-12-22T14:15:27.976Z,[20]\n2022-12-23T14:15:27.976Z,[30]\n2022-12-24T14:15:27.976Z,[40]\n2022-12-25T14:15:27.976Z,[50]"    
        }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).set("Accept", "text/csv").send(body);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(5);
        const body2= {
            body: "timestamp,values\n2022-12-26T14:15:27.976Z,30\n2022-12-27T14:15:27.976Z,40\n2022-12-28T14:15:27.976Z,50\n2022-12-29T14:15:27.976Z,60\n2022-12-30T14:15:27.976Z,70"    
        }
        const res2 = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).set("Accept", "text/csv").send(body2);
        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body.timesamples.length.should.be.eql(5);
        const res3 = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner));
        res3.should.have.status(200);
        res3.body.docs.should.be.a('array');
        res3.body.docs.length.should.be.eql(10);
    });

    it('it should POST only correct timesamples of a list', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample01 = { values: [1], timestamp: Date.now() };
        const timesample02 = { timestamp: Date.now() };
        const timesample03 = { values: [1], timestamp: Date.now() };
        const timesample04 = { values: [1], };
        const timesample05 = { values: [1], };
        const timesamples = [timesample01, timesample02, timesample03, timesample04, timesample05];
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesamples)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(3);
    });

    it('it should not POST a timesample non coherent with the measurement feature', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner,
            [{ "name": "a", "unit": "u", "type": "number", "dimension": 0 },
            { "name": "b", "unit": "u", "type": "number", "dimension": 1 }]
        );
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const timesample = { values: [0], timestamp: Date.now() }
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).send(timesample)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('No match between timesample values size and feature items size');
    });
});

// Test the /POST and GET file route
describe('/POST and GET file timeserie from a .csv file', () => {
    it('it should POST and GET a list of timesamples from a .csv file', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const items =[{ name: "item-name-1", unit: "items-unit-1", type: ItemTypes.number, dimension:0 },{ name: "item-name-2", unit: "items-unit-2", type: ItemTypes.number, dimension:1 }]
        const feature = await factory.createFeature("test-feature", owner,items);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const testFile = './test/dummies/timeserie_test.csv';        
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie/file').attach('file', testFile).set("Authorization", await factory.getUserToken(owner));       
        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(5);

        const res2 = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv');
        res2.should.have.status(200);
        res2.text.should.be.a('string');
        res2.text.should.contain('values,timestamp')
        res2.text.should.contain('[50;[10;5]],')
        res2.text.should.contain(',"2022-12-25T14:15:29.976Z"')        
    });

    it('it should POST and GET a list of timesamples from a .csv file to a Pandas Dataframe', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const items =[{ name: "item-name-1", unit: "items-unit-1", type: ItemTypes.number, dimension:0 },{ name: "item-name-2", unit: "items-unit-2", type: ItemTypes.number, dimension:1 }]
        const feature = await factory.createFeature("test-feature", owner,items);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const testFile = './test/dummies/timeserie_test.csv';        
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie/file').attach('file', testFile).set("Authorization", await factory.getUserToken(owner));       
        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(5);

        const res2 = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/dataframe');
        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body.timestamp.length.should.be.eql(5);
        res2.body.values.length.should.be.eql(5);   
        res2.body.timestamp[0].should.be.eql("2022-12-21T14:15:29.976Z"); 
        res2.body.values[0][0].should.be.eql(10); 
        res2.body.values[0][1].should.be.eql([10,5]); 
    });

    it('it should POST and GET a list of timesamples from a .csv file containing text values', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const items =[{ name: "item-name-1", unit: "items-unit-1", type: ItemTypes.text },{ name: "item-name-2", unit: "items-unit-2", type: ItemTypes.number, dimension:1 }]
        const feature = await factory.createFeature("test-feature", owner,items);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const testFile = './test/dummies/timeserie_with_string_test.csv';        
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie/file').attach('file', testFile).set("Authorization", await factory.getUserToken(owner));       
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(5);

        const res2 = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id + '/timeserie').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv');
        res2.should.have.status(200);
        res2.text.should.be.a('string');
        res2.text.should.contain('values,timestamp')
        res2.text.should.contain('"abc";[10;5]],')
        res2.text.should.contain('"2022-12-25T14:15:29.976Z"')     
    });

    it('it should POST and GET a list of timesamples from a .csv file changing separators', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const items =[{ name: "item-name-1", unit: "items-unit-1", type: ItemTypes.text },{ name: "item-name-2", unit: "items-unit-2", type: ItemTypes.number, dimension:1 }]
        const feature = await factory.createFeature("test-feature", owner,items);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
        const testFile = './test/dummies/timeserie_with_string_test_inverted_sep.csv';        
        const res = await chai.request(server).keepOpen().post('/v1/measurements/' + measurement._id + '/timeserie/file?sep=;&sepArray=,').attach('file', testFile).set("Authorization", await factory.getUserToken(owner));       
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.timesamples.length.should.be.eql(5);

        const res2 = await chai.request(server).keepOpen().get('/v1/measurements/' + measurement._id + '/timeserie?sep=;&sepArray=,').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv');
        res2.should.have.status(200);
        res2.text.should.be.a('string');
        res2.text.should.contain('values;timestamp')
        res2.text.should.contain('["abc",[10,5]];')
        res2.text.should.contain('["ab",[10,5]];')        
    });
});

// Test the /DELETE route
describe('/DELETE timeserie', () => {
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