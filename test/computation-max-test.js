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
const ItemTypes = require('../types/itemTypes.js');
const errors = require('../commons/errors.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

// Test the /POST route
describe('POST computation', () => {
    it('it should not post a computation on a fake feature', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1));
        const computation = { _id: "test-computation", code: "max", feature: "fake-feature", items: ["item-name-1"]};
        const res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('ValidationError: feature: Feature not existent');
    });

    it('it should not post a computation with a fake code', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1));
        const computation = { _id: "test-computation", code: "fake-code", feature: feature._id, items: ["item-name-1"]};
        const res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('Error: Computation validation failed: unrecognized code');
    });

    it('it should not post a computation for a non 1D item', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number, dimension:1}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples([[1,2]]));
        const computation = { _id: "test-computation", code: "max", feature: feature._id, items: ["item-name-1"] };
        const res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('Error: A computation is valid just on 1D item');
    });

    it('it should not post a computation without an item', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1));
        const computation = { _id: "test-computation", code: "max", feature: feature._id };
        const res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('Error: Computation validation failed: please specify items');
    });

    it('it should not post a computation without a code', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1));
        const computation = { _id: "test-computation", feature: feature._id, items: ["item-name-1"] };
        const res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('ValidationError: code: Please, supply the code');
    });

    it('it should not post a computation for a text measurements', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.text}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples("text"));
        const computation = { _id: "test-computation", code: "max", feature: feature._id, items: ["item-name-1"] };
        const res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('Error: A computation needs a numeric item');
    });

    it('it should post a max computation over single-sample, single-item measurements', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        const size_a = 10;
        for(let i=0; i<size_a; i++) await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(factory.random(30)));
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(52));
        const size_b = 10;
        for(let i=0; i<size_b; i++) await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(factory.random(30)));
        const computation = { _id: "test-computation", code: "max", feature: feature._id, items: ["item-name-1"] };
        let res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.status.should.be.eql("running");
        while(res.body.status == "running") res = await chai.request(server).keepOpen().get('/v1/computations/' + computation._id).set("Authorization", await factory.getUserToken(owner)); 
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.status.should.be.eql("concluded");
        res.body.results[0].value.should.be.eql(52);
    });

    it('it should post a max computation over single-sample, multiple-items measurements', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number},
                                                                            {name:'item-name-2', unit:'items-unit-1', type:ItemTypes.text},
                                                                            {name:'item-name-3', unit:'items-unit-1', type:ItemTypes.number}
                                                                            ]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        const size = 5;
        for(let i=0; i<size; i++) await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples([factory.random(30), "pippo", factory.random(30)]));
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples([52, "pippo", 22]));
        for(let i=0; i<size; i++) await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples([factory.random(30), "pippo", factory.random(30)]));
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples([22, "pippo", 90]));
        for(let i=0; i<size; i++) await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples([factory.random(30), "pippo", factory.random(30)]));
        const computation = { _id: "test-computation", code: "max", feature: feature._id, items: ["item-name-1", "item-name-3"] };
        let res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.status.should.be.eql("running");
        while(res.body.status == "running") res = await chai.request(server).keepOpen().get('/v1/computations/' + computation._id).set("Authorization", await factory.getUserToken(owner)); 
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.status.should.be.eql("concluded");
        res.body.results[0].value.should.be.eql(52);
        res.body.results[1].value.should.be.eql(90);
    });

    it('it should post a max computation over multi-sample, multi-items measurements', async () => {      
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.number},
                                                                            {name:'item-name-2', unit:'items-unit-1', type:ItemTypes.text},
                                                                            {name:'item-name-3', unit:'items-unit-1', type:ItemTypes.number}
                                                                            ]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        const size = 5;
        for(let i=0; i<size; i++) await factory.createMeasurement(owner, feature, device, thing, [], [factory.createSample([factory.random(30), "pippo", factory.random(30)]),
                                                                                                      factory.createSample([factory.random(30), "pippo", factory.random(30)]),
                                                                                                      factory.createSample([factory.random(30), "pippo", factory.random(30)])]);
        await factory.createMeasurement(owner, feature, device, thing, [], [factory.createSample([52, "pippo", 22]),
                                                                            factory.createSample([61, "pippo", 28]),
                                                                            factory.createSample([74, "pippo", 27]),
                                                                            factory.createSample([52, "pippo", 21])]);
        for(let i=0; i<size; i++) await factory.createMeasurement(owner, feature, device, thing, [], [factory.createSample([factory.random(30), "pippo", factory.random(30)]),
                                                                                                      factory.createSample([factory.random(30), "pippo", factory.random(30)]),
                                                                                                      factory.createSample([factory.random(30), "pippo", factory.random(30)])]);
        await factory.createMeasurement(owner, feature, device, thing, [], [factory.createSample([23, "pippo", 1]),
                                                                            factory.createSample([43, "pippo", 12]),
                                                                            factory.createSample([70, "pippo", 90]),
                                                                            factory.createSample([52, "pippo", 2])]);
        for(let i=0; i<size; i++) await factory.createMeasurement(owner, feature, device, thing, [], [factory.createSample([factory.random(30), "pippo", factory.random(30)]),
                                                                                                      factory.createSample([factory.random(30), "pippo", factory.random(30)]),
                                                                                                      factory.createSample([factory.random(30), "pippo", factory.random(30)])]);
        const computation = { _id: "test-computation", code: "max", feature: feature._id, items: ["item-name-1", "item-name-3"] };
        let res = await chai.request(server).keepOpen().post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.status.should.be.eql("running");
        while(res.body.status == "running") res = await chai.request(server).keepOpen().get('/v1/computations/' + computation._id).set("Authorization", await factory.getUserToken(owner)); 
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.status.should.be.eql("concluded");
        res.body.results[0].value.should.be.eql(74);
        res.body.results[1].value.should.be.eql(90);
    });

    it('it should post a max computation only over filtered measurement', async () => { 
    });
});
