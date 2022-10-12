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
const ExperimentStateTypes = require("../types/experimentStateTypes.js");

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
            anonymization: false,
            state: ExperimentStateTypes.completed,
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
            anonymization: false,
            state: ExperimentStateTypes.completed,
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
            anonymization: false,
            state: ExperimentStateTypes.completed,
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
            anonymization: false,
            state: ExperimentStateTypes.completed,
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
        res.should.have.status(errors.restricted_access_create.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access_create.message);
    });
});
/*
// READ LIST
describe('Access read a list of experiments', () => {
    it('it should get all the public/private experiments as admin or analyst and not as supplier', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const user_supplier = await factory.createUser("test-username-user1", "test-password-user", UserRoles.supplier);
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
        const experiment_public_1 = await factory.createExperiment("test-experiment-public-1", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);        
        const experiment_public_2 = await factory.createExperiment("test-experiment-public-2", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);
        const experiment_public_3 = await factory.createExperiment("test-experiment-public-3", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);
        const experiment_public_4 = await factory.createExperiment("test-experiment-public-4", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);
        const experiment_public_5 = await factory.createExperiment("test-experiment-public-5", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);
        const experiment_private_1 = await factory.createExperiment("test-experiment-private-1", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);
        const experiment_private_2 = await factory.createExperiment("test-experiment-private-2", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);
        const experiment_private_3 = await factory.createExperiment("test-experiment-private-3", "test-protocol-description", owner, true, ExperimentStateTypes.ongoing, null, null, null, protocol);
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
        const experiment_public_1 = await factory.createExperiment("test-experiment-public-1", owner, [], null, [], VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-public-2", user_provider, [], null, [], VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-public-3", owner, [], null, [], VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-public-4", user_provider, [], null, [], VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-public-5", user_provider, [], null, [], VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-private-1", user_provider, [], null, [], VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-private-2", owner, [], null, [], VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-private-3", user_provider, [], null, [], VisibilityTypes.private);
        const experiment_private_4 = await factory.createExperiment("test-experiment-private-4", owner, [], null, [], VisibilityTypes.private);
        const experiment_private_5 = await factory.createExperiment("test-experiment-private-5", owner, [], null, [], VisibilityTypes.private);
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
        const experiment_public_1 = await factory.createExperiment("test-experiment-public-1", owner, [], null, [], VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-public-2-search", user_provider, [], null, [], VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-public-3-search", owner, [], null, [], VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-public-4", user_provider, [], null, [], VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-public-5", user_provider, [], null, [], VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-private-1", user_provider, [], null, [], VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-private-2-search", owner, [], null, [], VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-private-3-search", user_provider, [], null, [], VisibilityTypes.private);
        const experiment_private_4 = await factory.createExperiment("test-experiment-private-4", owner, [], null, [], VisibilityTypes.private);
        const experiment_private_5 = await factory.createExperiment("test-experiment-private-5-search", owner, [], null, [], VisibilityTypes.private);
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
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment_public = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.public);
        const experiment_private = await factory.createExperiment("test-experiment-private", owner, [], null, [], VisibilityTypes.private);
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
        const experiment_public = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.public);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_public._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment_public._id.toString());
    });

    it('it should not get a private experiment as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment_private = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment_private._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_read.message);
    });

    it('it should get a public/private experiment as provider and owner', async () => {      
        const user_provider_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const experiment_public = await factory.createExperiment("test-experiment-public", user_provider_owner, [], null, [], VisibilityTypes.public);
        const experiment_private = await factory.createExperiment("test-experiment-private", user_provider_owner, [], null, [], VisibilityTypes.private);
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
        const experiment = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_admin)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(experiment._id.toString());
    });

    it('it should modify a experiment as provider and owner', async () => {      
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-public", user_provide_owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", user_provide_owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provide_owner)).send(modification);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.tags.length.should.be.eql(1);
        res.body._id.should.eql(experiment._id.toString());
    });

    it('it should not modify a experiment as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_analyst)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not modify a experiment as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.private);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });
});

// DELETE
describe('Access delete experiments', () => {
    it('it should delete a experiment as admin', async () => {      
        const user_admin = await factory.createUser("test-username-user", "test-password-user", UserRoles.admin);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_admin));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should delete a experiment as provider and owner', async () => {      
        const user_provide_owner = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-public", user_provide_owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provide_owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
    });

    it('it should not delete a experiment as analyst', async () => {      
        const user_analyst = await factory.createUser("test-username-user", "test-password-user", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_analyst));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });

    it('it should not delete a experiment as provider not owner', async () => {      
        const user_provider = await factory.createUser("test-username-user", "test-password-user", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-public", owner, [], null, [], VisibilityTypes.private);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
    });
}); 

// RIGTHS
describe('Access experiments with rights', () => {
    it('it should get all the public/private experiments with rights as analyst', async () => {      
        const user_admin = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.admin);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment_public_1 = await factory.createExperiment("test-experiment-1-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-2-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-3-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-4-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-5-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-1-private", owner, [], null, null, VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-2-private", owner, [], null, null, VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-3-private", owner, [], null, null, VisibilityTypes.private);
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
        const experiment_public_1 = await factory.createExperiment("test-experiment-1-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_2 = await factory.createExperiment("test-experiment-2-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_3 = await factory.createExperiment("test-experiment-3-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_4 = await factory.createExperiment("test-experiment-4-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_public_5 = await factory.createExperiment("test-experiment-5-public", owner, [], null, null, VisibilityTypes.public);
        const experiment_private_1 = await factory.createExperiment("test-experiment-1-private", owner, [], null, null, VisibilityTypes.private);
        const experiment_private_2 = await factory.createExperiment("test-experiment-2-private", user_provider, [], null, null, VisibilityTypes.private);
        const experiment_private_3 = await factory.createExperiment("test-experiment-3-private", owner, [], null, null, VisibilityTypes.private);
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
    });

    it('it should not read a experiment without rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const user_analyst = await factory.createUser("test-username-user-2", "test-password-user-2", UserRoles.analyst);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-1", owner, [], null, null, VisibilityTypes.public);
        const experiment_owned = await factory.createExperiment("test-experiment-2", owner, [], null, null, VisibilityTypes.public);
        const right_1 = await factory.createRight("right-test-1", experiment_owned, "Experiment", user_provider, owner, []);
        const right_2 = await factory.createRight("right-test-2", experiment_owned, "Experiment", user_analyst, owner, []);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
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
        const experiment = await factory.createExperiment("test-experiment-1", owner, [], null, null, VisibilityTypes.public);
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
        const experiment = await factory.createExperiment("test-experiment-1", user_provider, [], null, null, VisibilityTypes.public);
        const experiment_owned = await factory.createExperiment("test-experiment-2", owner, [], null, null, VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", experiment_owned, "Experiment", user_provider, owner, []);
        let res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider));
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should delete a experiment with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-1", user_provider, [], null, null, VisibilityTypes.public);
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
        const experiment = await factory.createExperiment("test-experiment-1", user_provider, [], null, null, VisibilityTypes.public);
        const experiment_owned = await factory.createExperiment("test-experiment-2", owner, [], null, null, VisibilityTypes.public);
        const right = await factory.createRight("right-test-1", experiment_owned, "Experiment", user_provider, owner, []);
        const tag = await factory.createTag("test-tag-1", owner);
        const modification = { tags: { add: [tag._id] } };
        let res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_provider)).send(modification);
        res.should.have.status(errors.restricted_access_read.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.be.eql(errors.restricted_access.message);
    });

    it('it should modify a experiment with rights', async () => {      
        const user_provider = await factory.createUser("test-username-user-1", "test-password-user-1", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const experiment = await factory.createExperiment("test-experiment-1", user_provider, [], null, null, VisibilityTypes.public);
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
        const tag = await factory.createTag("test-tag-1", owner);
        const tag_other = await factory.createTag("test-tag-2", owner);
        const right = await factory.createRight("right-test-1", tag_other, "Tag", provider, owner, []);
        const request = { _id: "experiment-name-text", items: [{ name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]};
        let res = await chai.request(server).keepOpen().post('/v1/experiments/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.body.message.should.be.a('string');
        res.should.have.status(errors.restricted_access.status);
        res.body.message.should.contain(errors.restricted_access.message);
        res.body.details.should.contain('You miss rigths on some resources');
    });

    it('it should create a experiment with rights', async () => {      
const provider = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.provider);
        const owner = await factory.createUser("test-username-owner", "test-password-owner", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const right = await factory.createRight("right-test-1", tag, "Tag", provider, owner, []);
        const request = { _id: "experiment-name-text", items: [ { name: 'item-name-1', unit: 'item-unit-1'}], tags:[tag._id]}
        let res = await chai.request(server).keepOpen().post('/v1/experiments/').set('Authorization', await factory.getUserToken(provider)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
    });
    
});
*/