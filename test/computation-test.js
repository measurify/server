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

chai.use(chaiHttp);

// Test the /POST route
describe('POST computation', () => {
    /*
    it('it should post a max computation over single sample, single scalar item measurements', async () => {
        await mongoose.connection.dropDatabase();
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
