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

describe('Run a computation', () => {
    it('it should GET all the computations', async () => {
        await mongoose.connection.dropDatabase();

        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature1 = await factory.createFeature("test-feature-1", owner);
        const feature2 = await factory.createFeature("test-feature-2", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature1, feature2]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature1, device, thing, [tag1], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature1, device, thing, [tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature2, device, thing, [tag1], factory.createSamples(3));
        const measurement4 = await factory.createMeasurement(owner, feature1, device, thing, [tag1, tag2], factory.createSamples(4));
        const measurement5 = await factory.createMeasurement(owner, feature2, device, thing, [tag1], factory.createSamples(5));
        let res = await chai.request(server).get('/v1/measurements?filter={"$or":[{"feature":"test-feature-1"}, {"tags":"test-tag-1"}]}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
        res = await chai.request(server).get('/v1/measurements?filter={"$or":[{"feature":"test-feature-1"},{"tags":"test-tag-2"}]}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).get('/v1/measurements?filter={"$or":[{"feature":"test-feature-2"},{"tags":"test-tag-2"}]}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);
        
    });
});

/*
// Test the /GET route
describe('/GET computation', () => {
    it('it should GET all the computations', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createComputation('test-computation-1', user, 'stdev()');
        await factory.createComputation('test-computation-2', user, 'avg()');
        const res = await chai.request(server).get('/v1/computations').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific computation', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const computation = await factory.createComputation("test-computation-1", user, "max()");
        const res = await chai.request(server).get('/v1/computations/' + computation._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(computation._id.toString());
    });

    it('it should not GET a fake computation', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/computations/fake-computation').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.message.should.contain("Computation fake-computation not found");
    });
});

// Test the /POST route
describe('/POST computation', () => {
    it('it should not POST a computation without code field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const computation = { owner: user }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.contain('Can\'t perform a computation without a code!');
    });

    it('it should not POST a computation with a fake code', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const computation = { _id: "test-computation-2", owner: user, code: "fake-code" }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql('Target resource not found!');
        //res.body.message.should.be.eql('No measurements match the current criteria!');
    });

    it('it should not POST a computation with a fake feature', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const computation = { _id: "test-computation-2", owner: user, code: "max()", featureId: "fake-id" }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql('Target resource not found!');
        //res.body.message.should.be.eql('Computation validation failed: featureId: Feature not existent');
    });

    it('it should not POST a computation with a fake tag', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const computation = { _id: "test-computation-2", owner: user, code: "max()", tags: ["fake-tag"] }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql('Target resource not found!');
        //res.body.message.should.be.eql('Computation validation failed: tags: Tag not existent');
    });

    it('it should not POST a computation with a fake thing', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const computation = { name: "test-computation-2", owner: user, code: "max.t()", things: ["fake-thing"] }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql('Target resource not found!');
        //res.body.message.should.be.eql('Computation validation failed: things: Thing not existent');
    });

    it('it should POST a Computation', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user, [{ name: "dimension-name-1", unit: "dimension-unit-1" }, { name: "dimension-name-2", unit: "dimension-unit-2" }]);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451, 0] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "max.t()",
            target: "measurements"
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });

    it('it should GET the computation posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/computations').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0].name.should.be.eql("test-computation-1");
    });

    it('it should POST a Computation with code column maximum', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "max.c()",
            target: "measurements",
            features: [{ feature: feature }]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });

    it('it should POST a Computation with code row maximum', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "max.r()",
            target: "measurements",
            features: [{ feature: feature }]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });

    it('it should POST a Computation with code total minimum', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "min.t()",
            target: "measurements",
            features: [{ feature: feature }]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });

    it('it should POST a Computation with code column minimum', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "min.c()",
            target: "measurements",
            features: [{ feature: feature }]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });

    it('it should POST a Computation with code row minimum', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "min.r()",
            target: "measurements",
            features: [{ feature: feature }]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });
    /*
        it('it should POST a Computation with code average column per samples', async () => {
            await mongoose.connection.dropDatabase();
            const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
            const feature = await factory.createFeature("test-feature-2", user, [{ name: "dimension-name-1", unit: "dimension-unit-1" }, { name: "dimension-name-2", unit: "dimension-unit-2" }]);
            const tag = await factory.createTag("test-tag", user);
            const device = await factory.createDevice("test-device-2", user, [feature]);
            const thing = await factory.createThing("test-thing-2", user);
            const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [[451], [2]] });
            const computation = {
                name: "test-computation-1",
                owner: user,
                code: "avg.cs()",
                target: "measurements",
                features: [{feature: feature}]
            }
            const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
            res.should.have.status(500);
            res.body.should.be.a('object');
            res.body.message.should.be.a('string');
            res.body.message.should.contain('Computation created:');
        });
    *//*
    it('it should not POST a Computation with code unknown', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "max.u()",
            target: "measurements",
            features: [{ feature: feature }]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql('Computation code unkown');
    });

    it('it should POST a computation with tags', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const newTag = await factory.createTag("new-tag", user)
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag, newTag], { "value": [451] });
        const computation = {
            name: "test-computation-2",
            owner: user,
            code: "max.t()",
            target: "measurements",
            tags: [tag, newTag]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });

    it('it should POST a computation with things', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const tag = await factory.createTag("test-tag", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag], { "value": [451] });
        const computation = {
            name: "test-computation-1",
            owner: user,
            code: "max.t()",
            target: "measurements",
            things: [thing]
        }
        const res = await chai.request(server).post('/v1/computations').set("Authorization", await factory.getUserToken(user)).send(computation)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain('Computation created:');
    });
});

// Test the /DELETE route
describe('/DELETE computation', () => {
    it('it should DELETE a computation', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const computation = await factory.createComputation('test-computation-1', user, 'max()');
        const computations_before = await Computation.find();
        computations_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/computations/' + computation._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const computations_after = await Computation.find();
        computations_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake computation', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const computation = await factory.createComputation('test-computation-2', user, 'max()');
        const computations_before = await Computation.find();
        computations_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/computations/fake_computation').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.message.should.contain("Computation fake_computation not found");
        const computations_after = await Computation.find();
        computations_after.length.should.be.eql(1);
    });
});
*/