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
const Computation = mongoose.model('Computation');
const User = mongoose.model('User');
const UserRoles = require('../types/userRoles.js');
const ItemTypes = require('../types/itemTypes.js');
const errors = require('../commons/errors.js');

chai.use(chaiHttp);

// Test the /POST route
describe('POST computation', () => {
    it('it should not post a computation on a fake feature', async () => {
        factory.dropContents();
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(1));
        const computation = { _id: "test-computation", code: "max", feature: "fake-feature", items: []};
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('A computation needs an existing feature');
    });
/*
    it('it should not post a computation for a text measurements', async () => {
        factory.dropContents();
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner, [{name:'item-name-1', unit:'items-unit-1', type:ItemTypes.text}]);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples("text"));
        const computation = { _id: "test-computation", code: "max", feature: feature._id, items: [] };
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.post_request_error.message);
        res.body.details.should.be.eql('A computation needs an numeric feature');
    });
*/
    it('it should not post a computation on a text item of a feature', async () => {
    });

    it('it should not post a computation on a non 1D item of a feature', async () => {
    });

    it('it should not post a computation without code field', async () => {
    });

    it('it should not post a computation without feature field', async () => {
    });

/*
    it('it should post a max computation over single-sample, single-scalar-item measurements', async () => {
        factory.dropContents();
        const owner = await factory.createUser("owner-username", "owner-password", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device", owner, [feature]);
        const thing = await factory.createThing("test-thing", owner);
        const size = 100;
        for(let i=0; i<size; i++) await factory.createMeasurement(owner, feature, device, thing, [], factory.createSamples(factory.random(30)));
        const computation = { _id: "test-computation", code: "max", feature: feature._id };
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(owner)).send(computation);
    });
*/
});
