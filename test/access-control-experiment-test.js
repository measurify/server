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
const before = require('./before-test.js');
const RoleCrudTypes = require('../types/roleCrudTypes.js');

// CREATE
describe('Access create experiments', () => {
    it('it should create a experiment as admin', async () => {
        const user_admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_admin, metadata, topics);
        const experiment = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user_admin)).send(experiment);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment._id);
    });

    it('it should create a experiment as provider', async () => {
        const user_provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_provider, metadata, topics);
        const experiment = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user_provider)).send(experiment);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment._id);
    });

    it('it should create a experiment as supplier', async () => {
        const user_supplier = await factory.createUser("test-username-1", "test-password-1", UserRoles.supplier);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_supplier, metadata, topics);
        const experiment = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user_supplier)).send(experiment);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment._id);
    });


    it('it should not create a experiment as analyst', async () => {
        const user_analyst = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_analyst, metadata, topics);
        const experiment = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user_analyst)).send(experiment);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);
    });
});

// READ LIST
describe('Access read a list of experiments', () => {
    it('it should get all the public/private experiments as admin or analyst and not as supplier', async () => {
        const user_admin = await factory.createUser("test-username-user1", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user2", "test-password-user", UserRoles.analyst);
        const user_supplier = await factory.createUser("test-username-user3", "test-password-user", UserRoles.supplier);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_public_1 = await factory.createExperiment("test-experiment-public-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-public-2", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-public-3", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-public-4", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-public-5", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-private-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-private-2", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-private-3", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_supplier));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(0);
    });

    it('it should get just his own or public experiments as provider', async () => {
        const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_public_1 = await factory.createExperiment("test-experiment-public-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-public-2", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-public-3", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-public-4", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-public-5", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-private-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-private-2", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-private-3", "test-protocol-description", user_provider, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_4 = await factory.createExperiment("test-experiment-private-4", "test-protocol-description", user_provider, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_5 = await factory.createExperiment("test-experiment-private-5", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(10);
    });

    it('it should get a filtered list of his own or public experiments as provider', async () => {
        const user_admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-provider", "test-password-provider", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_public_1 = await factory.createExperiment("test-experiment-public-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-public-2-search", "test-protocol-description-search", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-public-3-search", "test-protocol-description-search", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-public-4", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-public-5", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-private-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-private-2-search", "test-protocol-description-search", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-private-3-search", "test-protocol-description-search", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_4 = await factory.createExperiment("test-experiment-private-4", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_5 = await factory.createExperiment("test-experiment-private-5-search", "test-protocol-description-search", user_provider, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const filter = "{\"_id\":{\"$regex\": \"search\"}}";
        let res = await chai.request(server).keepOpen().get('/v1/experiments?filter=' + filter).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/experiments?filter=' + filter).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(5);
    });
});

// READ
describe('Access read a experiment', () => {
    it('it should get a public/private experiment as admin or analyst', async () => {
        const user_admin = await factory.createUser("test-username-user1", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user2", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_public = await factory.createExperiment("test-experiment-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private = await factory.createExperiment("test-experiment-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_private._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_private._id.toString());
    });

    it('it should get a public experiment as provider', async () => {
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_public = await factory.createExperiment("test-experiment-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_public._id.toString());
    });

    it('it should not get a private experiment as provider not owner', async () => {
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_private = await factory.createExperiment("test-experiment-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });

    it('it should get a public/private experiment as provider and owner', async () => {
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_provider_owner, metadata, topics);
        const experiment_public = await factory.createExperiment("test-experiment-public", "test-protocol-description", user_provider_owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private = await factory.createExperiment("test-experiment-private", "test-protocol-description", user_provider_owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_public._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_private._id.toString());
    });
});

// MODIFY
describe('Access modify experiments', () => {
    it('it should modify a experiment as admin', async () => {
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(experiment._id.toString());
    });

    it('it should modify a experiment as provider and owner', async () => {
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_provider_owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-private", "test-protocol-description", user_provider_owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provider_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(experiment._id.toString());
    });

    it('it should not modify a experiment as analyst', async () => {
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });

    it('it should not modify a experiment as provider not owner', async () => {
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });
});

// DELETE
describe('Access delete experiments', () => {
    it('it should delete a experiment as admin', async () => {
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a experiment as provider and owner', async () => {
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_provider_owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-private", "test-protocol-description", user_provider_owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a experiment as analyst', async () => {
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });

    it('it should not delete a experiment as provider not owner', async () => {
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });
});

// RIGTHS
describe('Access experiments with rights', () => {
    it('it should get all the public/private experiments with rights as analyst', async () => {
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_public_1 = await factory.createExperiment("test-experiment-1-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-2-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-3-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-4-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-5-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-1-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-2-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-3-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const right_1 = await factory.createRight("right-test-1", experiment_public_1, "Experiment", user_analyst, owner, []);
        const right_2 = await factory.createRight("right-test-2", experiment_public_2, "Experiment", user_analyst, owner, []);
        const right_3 = await factory.createRight("right-test-3", experiment_private_1, "Experiment", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
    });

    it('it should get all the public owned experiments with rights as provider', async () => {
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_provider = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment_public_1 = await factory.createExperiment("test-experiment-1-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-2-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-3-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-4-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-5-public", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-1-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-2-private", "test-protocol-description", user_provider, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-3-private", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const right_1 = await factory.createRight("right-test-1", experiment_private_2, "Experiment", user_provider, owner, []);
        const right_2 = await factory.createRight("right-test-2", experiment_private_1, "Experiment", user_provider, owner, []);
        const right_3 = await factory.createRight("right-test-3", experiment_public_1, "Experiment", user_provider, owner, []);
        const right_4 = await factory.createRight("right-test-4", experiment_public_2, "Experiment", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(8);
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(7);
    });

    it('it should get correctly the experiments with the right roles and the rights on multiple provider', async () => {
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_provider1 = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.provider);
        const user_provider2 = await factory.createUser("test-username-user-3", "test-password-user-3", UserRoles.provider);
        const user_provider3 = await factory.createUser("test-username-user-4", "test-password-user-4", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_admin, metadata, topics);
        const experiment_public_A = await factory.createExperiment("test-experiment-A-public", "test-protocol-description", user_provider1, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_public_B = await factory.createExperiment("test-experiment-B-public", "test-protocol-description", user_provider1, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_private_C = await factory.createExperiment("test-experiment-C-private", "test-protocol-description", user_provider1, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        const experiment_private_D = await factory.createExperiment("test-experiment-D-private", "test-protocol-description", user_provider2, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.private);
        
        //User provider 1
        let res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_provider1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res.body.docs[0]._id.should.be.eql(experiment_private_C._id);
        res.body.docs[1]._id.should.be.eql(experiment_public_B._id);
        res.body.docs[2]._id.should.be.eql(experiment_public_A._id);

        const tag1 = await factory.createTag("test-tag-1", user_admin);
        const tag2 = await factory.createTag("test-tag-1", user_admin);
        const tag3 = await factory.createTag("test-tag-1", user_admin);
        const modification1 = { tags: { add: [tag1._id] } };
        const modification2 = { tags: { add: [tag2._id] } };
        const modification3 = { tags: { add: [tag3._id] } };

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public_A._id).set("Authorization", await factory.getUserToken(user_provider1)).send(modification1);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags[0].should.be.eq(tag1._id);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public_B._id).set("Authorization", await factory.getUserToken(user_provider1)).send(modification1);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags[0].should.be.eq(tag1._id);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_private_C._id).set("Authorization", await factory.getUserToken(user_provider1)).send(modification1);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags[0].should.be.eq(tag1._id);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_private_D._id).set("Authorization", await factory.getUserToken(user_provider1)).send(modification1);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        //user provider 2
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_provider2));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);
        res.body.docs[0]._id.should.be.eql(experiment_private_D._id);
        res.body.docs[1]._id.should.be.eql(experiment_public_B._id);
        res.body.docs[2]._id.should.be.eql(experiment_public_A._id);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public_A._id).set("Authorization", await factory.getUserToken(user_provider2)).send(modification2);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public_B._id).set("Authorization", await factory.getUserToken(user_provider2)).send(modification2);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_private_C._id).set("Authorization", await factory.getUserToken(user_provider2)).send(modification2);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_private_D._id).set("Authorization", await factory.getUserToken(user_provider2)).send(modification2);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags[0].should.be.eq(tag1._id);

        //user provider 3
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_provider3));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
        res.body.docs[0]._id.should.be.eql(experiment_public_B._id);
        res.body.docs[1]._id.should.be.eql(experiment_public_A._id);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public_A._id).set("Authorization", await factory.getUserToken(user_provider3)).send(modification3);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public_B._id).set("Authorization", await factory.getUserToken(user_provider3)).send(modification3);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_private_C._id).set("Authorization", await factory.getUserToken(user_provider3)).send(modification3);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_private_D._id).set("Authorization", await factory.getUserToken(user_provider3)).send(modification3);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        //const right_1 = await factory.createRight("right-test-1", experiment_private_2, "Experiment", user_provider, owner, []);
        /*
         
         const right_2 = await factory.createRight("right-test-2", experiment_private_1, "Experiment", user_provider, owner, []);
         const right_3 = await factory.createRight("right-test-3", experiment_public_1, "Experiment", user_provider, owner, []);
         const right_4 = await factory.createRight("right-test-4", experiment_public_2, "Experiment", user_provider, owner, []);
         res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_admin));
         res.should.have.status(200);
         res.body.docs.should.be.a('array');
         res.body.docs.length.should.be.eql(8);
         res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(user_provider));
         res.should.have.status(200);
         res.body.docs.should.be.a('array');
         res.body.docs.length.should.be.eql(3);
         res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(owner));
         res.should.have.status(200);
         res.body.docs.should.be.a('array');
         res.body.docs.length.should.be.eql(7);
         */
    });

    it('it should not read a experiment without rights', async () => {
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_owned = await factory.createExperiment("test-experiment-2", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", experiment_owned, "Experiment", user_provider, owner, []);
        const right_2 = await factory.createRight("right-test-2", experiment_owned, "Experiment", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
        res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should read a experiment with rights', async () => {
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", experiment, "Experiment", user_provider, owner, []);
        const right_2 = await factory.createRight("right-test-2", experiment, "Experiment", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment._id.toString());
        res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment._id.toString());
    });
});

describe('Delete experiments with rights', () => {
    it('it should not delete a experiment without rights', async () => {
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description",user_provider,  0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_owned = await factory.createExperiment("test-experiment-2","test-protocol-description", owner, 0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", experiment_owned, "Experiment", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should delete a experiment with rights', async () => {
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description",user_provider,  0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", experiment, "Experiment", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Modify experiments with rights', () => {
    it('it should not modify a experiment without rights', async () => {
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description",user_provider,  0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const experiment_owned = await factory.createExperiment("test-experiment-2", "test-protocol-description",owner,  0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", experiment_owned, "Experiment", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should modify a experiment with rights', async () => {
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description",user_provider,  0, null, null, null, protocol, null, null, [], null, VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", experiment, "Experiment", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

describe('Create a a experiment with rights', () => {
    it('it should not create a experiment without rights on tag', async () => {
        const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight("right-test-1", tag_other, "Tag", provider, owner, []);
        const request = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: [tag._id]
        }
        let res = await chai.request(server).keepOpen().post('/v1/experiments/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.body.message.should.be.a('string');
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rights on some resources');
    });

    it('it should create a experiment with rights', async () => {
        const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", owner, metadata, topics);

        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight("right-test-1", tag, "Tag", provider, owner, []);
        const request = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: [tag._id]
        }
        let res = await chai.request(server).keepOpen().post('/v1/experiments/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
});

// ROLE CHECK 
describe('Custom role check for experiment', () => {
    it('it should create an experiment as different custom roles', async () => {
        const user_admin = await factory.createUser("test-username-admin", "test-password-1", UserRoles.admin);
        const crudAll = await factory.createCrud(true,RoleCrudTypes.all,RoleCrudTypes.all,RoleCrudTypes.all);
        const crudPO = await factory.createCrud(true,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned,RoleCrudTypes.public_and_owned);
        const crudOwned = await factory.createCrud(true,RoleCrudTypes.owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const crudNone = await factory.createCrud(true,RoleCrudTypes.none,RoleCrudTypes.none,RoleCrudTypes.none);
        
        const action1= {entity:"Experiment",crud:crudAll};
        const action2= {entity:"Experiment",crud:crudPO};
        const action3= {entity:"Experiment",crud:crudOwned};
        const action4= {entity:"Experiment",crud:crudNone};

        const role1= await factory.createRole("test-role-1", crudNone,[action1]);
        const role2=await factory.createRole("test-role-2", crudNone,[action2]);
        const role3= await factory.createRole("test-role-3", crudNone,[action3]);
        const role4=await factory.createRole("test-role-4", crudNone,[action4]);
        const user1 = await factory.createUser("test-username-1", "test-password-1", role1._id);
        const user2 = await factory.createUser("test-username-2", "test-password-2", role2._id);
        const user3 = await factory.createUser("test-username-3", "test-password-3", role3._id);
        const user4 = await factory.createUser("test-username-4", "test-password-4", role4._id);
       
        //protocol create
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_admin, metadata, topics,[],VisibilityTypes.public);
        
        //experiment  create  public
        const experiment_public = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: [],
            visibility:VisibilityTypes.public
        }

        //experiment  create private  
        const experiment_private = {
            _id: "test-experiment-2",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: [],
            visibility:VisibilityTypes.private
        }
        //USER ALL
        let res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user1)).send(experiment_public);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment_public._id);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);
        res.body.should.be.a('object');
        
        //USER PUBLIC AND OWNED
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user2)).send(experiment_public);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment_public._id);

        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(200);
        res.body.should.be.a('object');
        
        //other user experiment public
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user1)).send(experiment_public);
        res.should.have.status(200);        

        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(200);
        res.body.should.be.a('object');
        
        //NOT other user experiment private
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user1)).send(experiment_private);
        res.should.have.status(200);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);        
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);
        
        //user1 (all) can delete other user public experiment
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user2)).send(experiment_public);
        res.should.have.status(200);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);
        res.body.should.be.a('object');
        
        //user1 (all) can delete other user private experiment
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user2)).send(experiment_private);
        res.should.have.status(200);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);
        res.body.should.be.a('object');
        
        //USER OWNED
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user3)).send(experiment_public);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment_public._id);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user3));
        res.should.have.status(200);
        res.body.should.be.a('object');
        
        //NOT other user experiment public
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user1)).send(experiment_public);
        res.should.have.status(200);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user3));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);

        //NOT other user experiment private
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user1)).send(experiment_private);
        res.should.have.status(200);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user3));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);
        
        //USER NONE
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user4)).send(experiment_public);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment_public._id);

        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user4));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);

        //NOT other user experiment public
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user1)).send(experiment_public);
        res.should.have.status(200);

        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user4));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        
        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);

        //NOT other user experiment private
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user1)).send(experiment_private);
        res.should.have.status(200);

        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user4));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);

        res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user1));
        res.should.have.status(200);        
    });


    it('it should put an experiment when admin create a protocol and experiment public and give role provider plus get and put experiment public with rights only for one specific experiment', async () => {
        const user_admin = await factory.createUser("test-username-admin", "test-password-1", UserRoles.admin);        
        const defaultProvider = await factory.createCrud(true,RoleCrudTypes.public_and_owned,RoleCrudTypes.owned,RoleCrudTypes.owned);
        const ExperimentActionCrud = await factory.createCrud(null,null,RoleCrudTypes.public_and_owned,null);
        
        const action= {entity:"Experiment",crud:ExperimentActionCrud};
       
        const role0= await factory.createRole("test-role-0", defaultProvider);//default provider
        const role1= await factory.createRole("test-role-1", defaultProvider,[action]);
        
        const providerPlus = await factory.createUser("test-username-1", "test-password-1", role1._id);
        const provider1 = await factory.createUser("test-username-2", "test-password-2", role0._id);
        
       
        //protocol create
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" },
        { name: "metadata-name-2", description: "description metadata 1", type: "text" },
        { name: "metadata-name-3", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" },
            { name: "field-2", description: "field description 1", type: "text" },
            { name: "field-3", description: "field description 1", type: "vector" }]
        },
        {
            name: "topic name 2", description: "topic description 1",
            fields: [{ name: "field-4", description: "field description 4", type: "scalar" },
            { name: "field-5", description: "field description 5", type: "text" },
            { name: "field-6", description: "field description 6", type: "vector" }]
        }]

        //Admin post protocol
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_admin, metadata, topics,[],VisibilityTypes.public);
        
        //create experiment public 1
        const experiment_public1 = {
            _id: "test-experiment-1",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: [],
            visibility:VisibilityTypes.public
        }

        //create experiment public 2
        const experiment_public2 = {
            _id: "test-experiment-2",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 50 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: [],
            visibility:VisibilityTypes.public
        }

        //create experiment public 3
        const experiment_public3 = {
            _id: "test-experiment-3",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 50 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: [],
            visibility:VisibilityTypes.public
        }

        //ADMIN post experiment
        let res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user_admin)).send(experiment_public1);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment_public1._id);   

        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user_admin)).send(experiment_public2);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment_public2._id);
        
        //Provider1 post experiment 
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(provider1)).send(experiment_public3);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql(experiment_public3._id); 
        
        //right for providerPlus to see only experiment_public1
        const right_1 = await factory.createRight("right-test-1", experiment_public1, "Experiment", providerPlus, user_admin, []);
        
        //providerPlus should get only experiment1
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(providerPlus));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql(experiment_public1._id);

        //provider1 should get all experiments
        res = await chai.request(server).keepOpen().get('/v1/experiments/').set("Authorization", await factory.getUserToken(provider1));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(3);

        //prepare put history
        const history={
            step: 2, timestamp: Date.now(), fields: [{ name: "field-1", value: 1 },
            { name: "field-2", value: "my string A" },
            { name: "field-3", value: [4, 5] },
            { name: "field-4", value: 60 },
            { name: "field-5", value: "my string B" },
            { name: "field-6", value: [10, 20] }]
        }
        const modification = { history: { add: [history] } };

        //provider1 can't modify
        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public1._id).set("Authorization", await factory.getUserToken(provider1)).send(modification);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_operation.message);

        //providerPlus can modify
        res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public1._id).set("Authorization", await factory.getUserToken(providerPlus)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.history.length.should.be.eql(2);
        res.body._id.should.eql(experiment_public1._id);

         //providerPlus can't modify experiment public 2
         res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public2._id).set("Authorization", await factory.getUserToken(providerPlus)).send(modification);
         res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);

         //providerPlus can't modify experiment public 3
         res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment_public3._id).set("Authorization", await factory.getUserToken(providerPlus)).send(modification);
         res.should.have.status(errors.restricted_access.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });
});
