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
const MetadataTypes = require('../types/metadataTypes.js');
const TopicFieldTypes = require('../types/topicFieldTypes.js');
//const ExperimentStateTypes = require("../types/experimentStateTypes.js");

// Test the /GET route

describe('/GET experiment', () => {
    it('it should GET all the experiments', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        await factory.createExperiment("test-experiment-2", "test-protoco-description-2", user, 0, null, null, null, protocol);
        const res = await chai.request(server).keepOpen().get('/v1/experiments').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET all the experiments id with query select', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        await factory.createExperiment("test-experiment-2", "test-protoco-description-2", user, 0, null, null, null, protocol);
        let res = await chai.request(server).keepOpen().get('/v1/experiments?select=["_id","visibility","state"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(3);
        Object.keys(res.body.docs[1]).length.should.be.eql(3);
        res.body.docs[0]._id.should.be.eql("test-experiment-2");
        res.body.docs[0].visibility.should.be.eql("private");
        res.body.docs[0].state.should.be.eql(0);
        res = await chai.request(server).keepOpen().get('/v1/experiments?select=["visibility","state"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(3);
        Object.keys(res.body.docs[1]).length.should.be.eql(3);
        res.body.docs[0]._id.should.be.eql("test-experiment-2");
        res.body.docs[0].visibility.should.be.eql("private");
        res.body.docs[0].state.should.be.eql(0);
        res = await chai.request(server).keepOpen().get('/v1/experiments?select=["_id"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(1);
        Object.keys(res.body.docs[1]).length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("test-experiment-2");
        res = await chai.request(server).keepOpen().get('/v1/experiments?select=["fakeField"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);        
        Object.keys(res.body.docs[0]).length.should.be.eql(1);
        Object.keys(res.body.docs[1]).length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("test-experiment-2");
    });

    it('it should GET one experiment with query select', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        let res = await chai.request(server).keepOpen().get('/v1/experiments/test-experiment-1?select=["_id","visibility","state"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');     
        Object.keys(res.body).length.should.be.eql(3);
        res.body._id.should.be.eql("test-experiment-1");
        res.body.visibility.should.be.eql("private");
        res.body.state.should.be.eql(0);
        res = await chai.request(server).keepOpen().get('/v1/experiments/test-experiment-1?select=["visibility","state"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');     
        Object.keys(res.body).length.should.be.eql(3);
        res.body._id.should.be.eql("test-experiment-1");
        res.body.visibility.should.be.eql("private");
        res.body.state.should.be.eql(0);
        res = await chai.request(server).keepOpen().get('/v1/experiments/test-experiment-1?select=["_id"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');     
        Object.keys(res.body).length.should.be.eql(1);
        res.body._id.should.be.eql("test-experiment-1");
        res = await chai.request(server).keepOpen().get('/v1/experiments/test-experiment-1?select=["fakeField"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');     
        Object.keys(res.body).length.should.be.eql(1);
        res.body._id.should.be.eql("test-experiment-1");
    });

    it('it should GET a specific experiment', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment", "test-protoco-description", user, 0, null, null, null, protocol);
        const res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(experiment._id.toString());
    });

    it('it should not GET a fake experiment', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/experiments/fake-experiment').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });

    it('it should GET a history of an experiment in csv', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment", "test-protoco-description", user, 0, null, null, null, protocol);
        const res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/history').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('string');
        res.body.should.contain("step,");
        res.body.should.contain(experiment.history[0].fields[0].name+',');
        res.body.should.contain(experiment.history[0].fields[1].name+',');
        res.body.should.contain(experiment.history[0].fields[2].name+',');
    });

    it('it should GET a history of an experiment in csv with inverted sep and sepArray', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [
            { "name": "metadata-name-1", "description": "description metadata 1", "type": "scalar"},
            { "name": "metadata-name-2", "description": "description metadata 2", "type": "text"},
            { "name": "metadata-name-3", "description": "description metadata 3", "type": "scalar"},
            { "name": "metadata-name-4", "description": "description metadata 4", "type": "vector"}
        ]
        const topics = [
            {
                "name": "topic name 1",
                "description": "topic description 1",
                "fields": [
                    { "name": "field-1", "description": "field description 1", "type": "scalar"},
                    { "name": "field-2", "description": "field description 2", "type": "text"},
                    { "name": "field-3", "description": "field description 3", "type": "vector"}
                ]
            },
            {
                "name": "topic name 2",
                "description": "topic description 2",
                "fields": [
                    { "name": "field-4", "description": "field description 4", "type": "scalar"},
                    { "name": "field-5", "description": "field description 5", "type": "text"},
                    { "name": "field-6", "description": "field description 6", "type": "vector"}
                ]
            }
        ] 
        const protocol = await factory.createProtocol("test-protocol-1", "test-protocol-description-1", user, metadata, topics);
        const experiment = {
            "_id": "experiment id",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [
                { "name": "metadata-name-1", "value": 10 },
                { "name": "metadata-name-2", "value": "value 2" },
                { "name": "metadata-name-3", "value": 55 },
                { "name": "metadata-name-4", "value": [34, 25, 45] }
            ],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 55 },
                        { "name": "field-2", "value": "text value" },
                        { "name": "field-3", "value": [21, 32, 432] },
                        { "name": "field-4", "value": 13 },
                        { "name": "field-5", "value": "another text value" },
                        { "name": "field-6", "value": [324, 432, 432]  }
                    ]
                },
                {
                    "step": 2,
                    "timestamp": "2022-12-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 65 },
                        { "name": "field-2", "value": "text value 2" },
                        { "name": "field-3", "value": [3.5, 56] },
                        { "name": "field-4", "value": 33.5 },
                        { "name": "field-5", "value": "another text value 2" },
                        { "name": "field-6", "value": [543.5, 534, 5656]  }
                    ]
                }
            ]
        }
        const res0 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res0.should.have.status(200);


        const res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/history?sep=;&sepArray=,').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        
        res.body.should.be.a('string');
        res.body.should.contain("step;1;2\nfield-1;55;65\nfield-2;text value;text value 2\nfield-3;[21,32,432];[3.5,56]\nfield-4;13;33.5\nfield-5;another text value;another text value 2\nfield-6;[324,432,432];[543.5,534,5656]\n");
    });

    it('it should GET a history of an experiment in csv with inverted sep and sepArray and sepFloat', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [
            { "name": "metadata-name-1", "description": "description metadata 1", "type": "scalar"},
            { "name": "metadata-name-2", "description": "description metadata 2", "type": "text"},
            { "name": "metadata-name-3", "description": "description metadata 3", "type": "scalar"},
            { "name": "metadata-name-4", "description": "description metadata 4", "type": "vector"}
        ]
        const topics = [
            {
                "name": "topic name 1",
                "description": "topic description 1",
                "fields": [
                    { "name": "field-1", "description": "field description 1", "type": "scalar"},
                    { "name": "field-2", "description": "field description 2", "type": "text"},
                    { "name": "field-3", "description": "field description 3", "type": "vector"}
                ]
            },
            {
                "name": "topic name 2",
                "description": "topic description 2",
                "fields": [
                    { "name": "field-4", "description": "field description 4", "type": "scalar"},
                    { "name": "field-5", "description": "field description 5", "type": "text"},
                    { "name": "field-6", "description": "field description 6", "type": "vector"}
                ]
            }
        ] 
        const protocol = await factory.createProtocol("test-protocol-1", "test-protocol-description-1", user, metadata, topics);
        const experiment = {
            "_id": "experiment id",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [
                { "name": "metadata-name-1", "value": 10 },
                { "name": "metadata-name-2", "value": "value 2" },
                { "name": "metadata-name-3", "value": 55 },
                { "name": "metadata-name-4", "value": [34, 25, 45] }
            ],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 55 },
                        { "name": "field-2", "value": "text value" },
                        { "name": "field-3", "value": [21, 32, 432] },
                        { "name": "field-4", "value": 13 },
                        { "name": "field-5", "value": "another text value" },
                        { "name": "field-6", "value": [324, 432, 432]  }
                    ]
                },
                {
                    "step": 2,
                    "timestamp": "2022-12-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 65 },
                        { "name": "field-2", "value": "text value 2" },
                        { "name": "field-3", "value": [3.5, 56] },
                        { "name": "field-4", "value": 33.5 },
                        { "name": "field-5", "value": "another text value 2" },
                        { "name": "field-6", "value": [543.5, 534, 5656]  }
                    ]
                }
            ]
        }
        const res0 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res0.should.have.status(200);

        
        const res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/history?sep=;&sepArray=.&sepFloat=,').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('string');
        res.body.should.contain("step;1;2\nfield-1;55;65\nfield-2;text value;text value 2\nfield-3;[21.32.432];[3,5.56]\nfield-4;13;33,5\nfield-5;another text value;another text value 2\nfield-6;[324.432.432];[543,5.534.5656]\n");
    });
});

// Test the /GET group route
describe('/GET experiment group', () => {
    it('it should GET all groups', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [
            { "name": "metadata-name-1", "description": "description metadata 1", "type": "scalar","unit":"unit",},
            { "name": "metadata-name-2", "description": "description metadata 2", "type": "text","unit":"unit",},
            { "name": "metadata-name-3", "description": "description metadata 3", "type": "scalar","unit":"unit",},
            { "name": "metadata-name-4", "description": "description metadata 4", "type": "vector","unit":"unit",}
        ]
        const topics = [
            {
                "name": "topics1",
                "description": "topic description 1",
                "unit":"unit1",
                "fields": [
                    { "name": "field-1", "description": "field description 1", "type": "scalar"},
                    { "name": "field-2", "description": "field description 2", "type": "text"},
                    { "name": "field-3", "description": "field description 3", "type": "vector"}
                ]
            },
            {
                "name": "topics2",
                "description": "topic description 2",
                "unit":"unit2",
                "fields": [
                    { "name": "field-4", "description": "field description 4", "type": "scalar"},
                    { "name": "field-5", "description": "field description 5", "type": "text"},
                    { "name": "field-6", "description": "field description 6", "type": "vector"}
                ]
            }
        ] 
        const protocol = await factory.createProtocol("test-protocol-1", "test-protocol-description-1", user, metadata, topics);
        const experiment = {
            "_id": "experiment id",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [
                { "name": "metadata-name-1", "value": 10 },
                { "name": "metadata-name-2", "value": "value 2" },
                { "name": "metadata-name-3", "value": 55 },
                { "name": "metadata-name-4", "value": [34, 25, 45] }
            ],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 55 },
                        { "name": "field-2", "value": "text value" },
                        { "name": "field-3", "value": [21, 32, 432] },
                        { "name": "field-4", "value": 13 },
                        { "name": "field-5", "value": "another text value" },
                        { "name": "field-6", "value": [324, 432, 432]  }
                    ]
                },
                {
                    "step": 2,
                    "timestamp": "2022-12-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 65 },
                        { "name": "field-2", "value": "text value 2" },
                        { "name": "field-3", "value": [3.5, 56] },
                        { "name": "field-4", "value": 33.5 },
                        { "name": "field-5", "value": "another text value 2" },
                        { "name": "field-6", "value": [543.5, 534, 5656]  }
                    ]
                }
            ]
        }
        const res0 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res0.should.have.status(200);

        
        const res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/group').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql('experiment id');
        res.body.history.length.should.be.eql(2);
        res.body.history[0].step.should.be.eql(1);
        res.body.history[1].step.should.be.eql(2);
        Object.keys(res.body.history[0].groups).length.should.be.eql(2);
        Object.keys(res.body.history[1].groups).length.should.be.eql(2);

        Object.keys(res.body.history[0].groups.topics1).length.should.be.eql(3);
        Object.keys(res.body.history[0].groups.topics1.values).length.should.be.eql(3);
        res.body.history[0].groups.topics1.unit.should.be.eql("unit1");
        res.body.history[0].groups.topics1.description.should.be.eql("topic description 1");

        Object.keys(res.body.history[0].groups.topics2).length.should.be.eql(3);
        Object.keys(res.body.history[0].groups.topics2.values).length.should.be.eql(3);
        res.body.history[0].groups.topics2.unit.should.be.eql("unit2");
        res.body.history[0].groups.topics2.description.should.be.eql("topic description 2");

        Object.keys(res.body.history[1].groups.topics1.values).length.should.be.eql(3);
        Object.keys(res.body.history[1].groups.topics2.values).length.should.be.eql(3);       
        
        const res2 = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/group?groups=[]').set("Authorization", await factory.getUserToken(user));
        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body._id.should.be.eql('experiment id');
        res2.body.history.length.should.be.eql(2);
        res2.body.history[0].step.should.be.eql(1);
        res2.body.history[1].step.should.be.eql(2);
        Object.keys(res2.body.history[0].groups).length.should.be.eql(0);
        Object.keys(res2.body.history[1].groups).length.should.be.eql(0);    
    });

    it('it should GET specified groups', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [
            { "name": "metadata-name-1", "description": "description metadata 1", "type": "scalar"},
            { "name": "metadata-name-2", "description": "description metadata 2", "type": "text"},
            { "name": "metadata-name-3", "description": "description metadata 3", "type": "scalar"},
            { "name": "metadata-name-4", "description": "description metadata 4", "type": "vector"}
        ]
        const topics = [
            {
                "name": "topics1",
                "description": "topic description 1",
                "unit":"unit1",
                "fields": [
                    { "name": "field-1", "description": "field description 1", "type": "scalar"},
                    { "name": "field-2", "description": "field description 2", "type": "text"},
                    { "name": "field-3", "description": "field description 3", "type": "vector"}
                ]
            },
            {
                "name": "topics2",
                "description": "topic description 2",
                "unit":"unit1",
                "fields": [
                    { "name": "field-4", "description": "field description 4", "type": "scalar"},
                    { "name": "field-5", "description": "field description 5", "type": "text"},
                    { "name": "field-6", "description": "field description 6", "type": "vector"}
                ]
            },
            {
                "name": "topics3",
                "description": "topic description 3",
                "unit":"unit1",
                "fields": [
                    { "name": "field-7", "description": "field description 7", "type": "scalar"},
                    { "name": "field-8", "description": "field description 8", "type": "text"},
                    { "name": "field-9", "description": "field description 9", "type": "vector"}
                ]
            }
        ] 
        const protocol = await factory.createProtocol("test-protocol-1", "test-protocol-description-1", user, metadata, topics);
        const experiment = {
            "_id": "experiment id",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [
                { "name": "metadata-name-1", "value": 10 },
                { "name": "metadata-name-2", "value": "value 2" },
                { "name": "metadata-name-3", "value": 55 },
                { "name": "metadata-name-4", "value": [34, 25, 45] }
            ],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 55 },
                        { "name": "field-2", "value": "text value" },
                        { "name": "field-3", "value": [21, 32, 432] },
                        { "name": "field-4", "value": 13 },
                        { "name": "field-5", "value": "another text value" },
                        { "name": "field-6", "value": [324, 432, 432]  },
                        { "name": "field-7", "value": 13 },
                        { "name": "field-8", "value": "another text value" },
                        { "name": "field-9", "value": [324, 432, 432]  }
                    ]
                },
                {
                    "step": 2,
                    "timestamp": "2022-12-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 65 },
                        { "name": "field-2", "value": "text value 2" },
                        { "name": "field-3", "value": [3.5, 56] },
                        { "name": "field-4", "value": 33.5 },
                        { "name": "field-5", "value": "another text value 2" },
                        { "name": "field-6", "value": [543.5, 534, 5656]  },
                        { "name": "field-7", "value": 13 },
                        { "name": "field-8", "value": "another text value" },
                        { "name": "field-9", "value": [324, 432, 432]  }
                    ]
                }
            ]
        }
        const res0 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res0.should.have.status(200);

        
        const res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/group?groups=["topics1"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql('experiment id');
        res.body.history.length.should.be.eql(2);
        res.body.history[0].step.should.be.eql(1);
        res.body.history[1].step.should.be.eql(2);
        Object.keys(res.body.history[0].groups).length.should.be.eql(1);
        Object.keys(res.body.history[1].groups).length.should.be.eql(1);
        Object.keys(res.body.history[0].groups.topics1).length.should.be.eql(3);
        Object.keys(res.body.history[1].groups.topics1).length.should.be.eql(3);  
        Object.keys(res.body.history[0].groups.topics1.values).length.should.be.eql(3);
        Object.keys(res.body.history[1].groups.topics1.values).length.should.be.eql(3); 
        res.body.history[0].groups.topics1.description.should.be.eql("topic description 1"); 
        res.body.history[0].groups.topics1.unit.should.be.eql("unit1"); 


        const res2 = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/group?groups=["topics1","topics3"]').set("Authorization", await factory.getUserToken(user));
        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body._id.should.be.eql('experiment id');
        res2.body.history.length.should.be.eql(2);
        res2.body.history[0].step.should.be.eql(1);
        res2.body.history[1].step.should.be.eql(2);
        Object.keys(res2.body.history[0].groups).length.should.be.eql(2);
        Object.keys(res2.body.history[1].groups).length.should.be.eql(2);
        Object.keys(res2.body.history[0].groups.topics1).length.should.be.eql(3);
        Object.keys(res2.body.history[0].groups.topics3).length.should.be.eql(3);
        Object.keys(res2.body.history[1].groups.topics1).length.should.be.eql(3);
        Object.keys(res2.body.history[1].groups.topics3).length.should.be.eql(3);   
        Object.keys(res2.body.history[0].groups.topics1.values).length.should.be.eql(3);
        Object.keys(res2.body.history[1].groups.topics1.values).length.should.be.eql(3); 
        res.body.history[0].groups.topics1.description.should.be.eql("topic description 1"); 
        res.body.history[0].groups.topics1.unit.should.be.eql("unit1"); 
    });

    it('it should GET specified groups with correct management of missing fields', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [
            { "name": "metadata-name-1", "description": "description metadata 1", "type": "scalar"},
            { "name": "metadata-name-2", "description": "description metadata 2", "type": "text"},
            { "name": "metadata-name-3", "description": "description metadata 3", "type": "scalar"},
            { "name": "metadata-name-4", "description": "description metadata 4", "type": "vector"}
        ]
        const topics = [
            {
                "name": "topics1",
                "description": "topic description 1",
                "fields": [
                    { "name": "field-1", "description": "field description 1", "type": "scalar"},
                    { "name": "field-2", "description": "field description 2", "type": "text"},
                    { "name": "field-3", "description": "field description 3", "type": "vector"}
                ]
            },
            {
                "name": "topics2",
                "description": "topic description 2",
                "fields": [
                    { "name": "field-4", "description": "field description 4", "type": "scalar"},
                    { "name": "field-5", "description": "field description 5", "type": "text"},
                    { "name": "field-6", "description": "field description 6", "type": "vector"}
                ]
            },
            {
                "name": "topics3",
                "description": "topic description 3",
                "fields": [
                    { "name": "field-7", "description": "field description 7", "type": "scalar"},
                    { "name": "field-8", "description": "field description 8", "type": "text"},
                    { "name": "field-9", "description": "field description 9", "type": "vector"}
                ]
            }
        ] 
        const protocol = await factory.createProtocol("test-protocol-1", "test-protocol-description-1", user, metadata, topics);
        const experiment = {
            "_id": "experiment id",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [
                { "name": "metadata-name-1", "value": 10 },
                { "name": "metadata-name-2", "value": "value 2" },
                { "name": "metadata-name-3", "value": 55 },
                { "name": "metadata-name-4", "value": [34, 25, 45] }
            ],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 55 },
                        { "name": "field-2", "value": "text value" },                        
                        { "name": "field-4", "value": 13 },
                        { "name": "field-5", "value": "another text value" },
                        { "name": "field-6", "value": [324, 432, 432]  },
                        { "name": "field-7", "value": 13 },                        
                        { "name": "field-9", "value": [324, 432, 432]  }
                    ]
                },
                {
                    "step": 2,
                    "timestamp": "2022-12-15T18:15:17.396Z",
                    "fields": [                        
                        { "name": "field-2", "value": "text value 2" },
                        { "name": "field-3", "value": [3.5, 56] },
                        { "name": "field-4", "value": 33.5 },
                        { "name": "field-5", "value": "another text value 2" },
                        { "name": "field-6", "value": [543.5, 534, 5656]  },
                        { "name": "field-7", "value": 13 },                        
                        { "name": "field-9", "value": [324, 432, 432]  }
                    ]
                }
            ]
        }
        const res0 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res0.should.have.status(200);

        
        const res = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/group?groups=["topics1"]').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.be.eql('experiment id');
        res.body.history.length.should.be.eql(2);
        res.body.history[0].step.should.be.eql(1);
        res.body.history[1].step.should.be.eql(2);
        Object.keys(res.body.history[0].groups).length.should.be.eql(1);
        Object.keys(res.body.history[1].groups).length.should.be.eql(1);
        Object.keys(res.body.history[0].groups.topics1).length.should.be.eql(2);
        Object.keys(res.body.history[1].groups.topics1).length.should.be.eql(2);      

        const res2 = await chai.request(server).keepOpen().get('/v1/experiments/' + experiment._id+'/group?groups=["topics1","topics3"]').set("Authorization", await factory.getUserToken(user));
        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body._id.should.be.eql('experiment id');
        res2.body.history.length.should.be.eql(2);
        res2.body.history[0].step.should.be.eql(1);
        res2.body.history[1].step.should.be.eql(2);
        Object.keys(res2.body.history[0].groups).length.should.be.eql(2);
        Object.keys(res2.body.history[1].groups).length.should.be.eql(2);
        Object.keys(res2.body.history[0].groups.topics1).length.should.be.eql(2);
        Object.keys(res2.body.history[0].groups.topics3).length.should.be.eql(2);
        Object.keys(res2.body.history[1].groups.topics1).length.should.be.eql(2);
        Object.keys(res2.body.history[1].groups.topics3).length.should.be.eql(2);   
    });
});

// Test the /GET aggregated route
describe('/GET experiment aggregated', () => {
    it('it should GET all or filtered aggregated', async () => {        
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = []
        const topics = [
            {
                "name": "topic name 1",
                "description": "topic description 1",
                "fields": [
                    { "name": "field-1", "description": "field description 1", "type": "scalar"},
                    { "name": "field-2", "description": "field description 2", "type": "text"},
                    { "name": "field-3", "description": "field description 3", "type": "vector"}
                ]
            },
            {
                "name": "topic name 2",
                "description": "topic description 2",
                "fields": [
                    { "name": "field-4", "description": "field description 4", "type": "scalar"},
                    { "name": "field-5", "description": "field description 5", "type": "text"},
                    { "name": "field-6", "description": "field description 6", "type": "vector"}
                ]
            }
        ] 
        const protocol = await factory.createProtocol("test-protocol-1", "test-protocol-description-1", user, metadata, topics);
        const experiment1 = {
            "_id": "experiment_id1",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 1 },
                        { "name": "field-2", "value": "text value" },
                        { "name": "field-3", "value": [1, 1, 1] },
                        { "name": "field-4", "value": 1 },
                        { "name": "field-5", "value": "another text value" },
                        { "name": "field-6", "value": [1, 1, 1]  }
                    ]
                },
                {
                    "step": 2,
                    "timestamp": "2022-12-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 1 },
                        { "name": "field-2", "value": "text value 2" },
                        { "name": "field-3", "value": [1, 1] },
                        { "name": "field-4", "value": 1 },
                        { "name": "field-5", "value": "another text value 2" },
                        { "name": "field-6", "value": [1, 1, 1]  }
                    ]
                }
            ]
        }
        const experiment2 = {
            "_id": "experiment_id2",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 2 },
                        { "name": "field-2", "value": "text value 3" },
                        { "name": "field-3", "value": [2, 2, 2] },
                        { "name": "field-4", "value": 2 },
                        { "name": "field-5", "value": "another text value 3" },
                        { "name": "field-6", "value": [2, 2, 2]  }
                    ]
                }
            ]
        }
        const experiment3 = {
            "_id": "experiment_id3",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 3 },
                        { "name": "field-2", "value": "text value 4" },
                        { "name": "field-3", "value": [3, 3, 3] },
                        { "name": "field-4", "value": 3 },
                        { "name": "field-5", "value": "another text value 4" },
                        { "name": "field-6", "value": [3, 3, 3]  }
                    ]
                }
            ]
        }
        const experiment4 = {
            "_id": "experiment_id4",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": []
        }
        const res0 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment1)
        res0.should.have.status(200);
        const res1 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment2)
        res1.should.have.status(200);
        const res2 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment3)
        res2.should.have.status(200);
        const res3 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment4)
        res3.should.have.status(200);


        const res = await chai.request(server).keepOpen().get('/v1/experiments/aggregated_experiments').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);  
        res.body.should.be.a('object');
        res.body.should.have.property('_ids');
        res.body.should.have.property('aggregated_histories');
        res.body._ids.should.be.an('array').that.includes('experiment_id1', 'experiment_id2', 'experiment_id3');
        res.body.aggregated_histories.should.have.property('field-1');
        res.body.aggregated_histories.should.have.property('field-2');
        res.body.aggregated_histories.should.have.property('field-3');
        res.body.aggregated_histories.should.have.property('field-4');
        res.body.aggregated_histories.should.have.property('field-5');
        res.body.aggregated_histories.should.have.property('field-6');
        res.body.aggregated_histories['field-1'].should.be.an('number').deep.equal(7);
        res.body.aggregated_histories['field-2'].should.be.an('array').that.includes('text value', 'text value 2', 'text value 3', 'text value 4');
        res.body.aggregated_histories['field-3'].should.be.an('array').deep.equal([7, 7, 6]);
        res.body.aggregated_histories['field-4'].should.be.an('number').deep.equal(7);
        res.body.aggregated_histories['field-5'].should.be.an('array').that.includes('another text value', 'another text value 2', 'another text value 3', 'another text value 4');
        res.body.aggregated_histories['field-6'].should.be.an('array').deep.equal([7, 7, 7]);

        const resB = await chai.request(server).keepOpen().get('/v1/experiments/aggregated_experiments?filter={"$or":[{"_id":"experiment_id2"},{"_id":"experiment_id3"}]}').set("Authorization", await factory.getUserToken(user));
        resB.should.have.status(200);  
        resB.body.should.be.a('object');
        resB.body.should.have.property('_ids');
        resB.body.should.have.property('aggregated_histories');
        resB.body._ids.should.be.an('array').that.includes('experiment_id2', 'experiment_id3');
        resB.body.aggregated_histories.should.have.property('field-1');
        resB.body.aggregated_histories.should.have.property('field-2');
        resB.body.aggregated_histories.should.have.property('field-3');
        resB.body.aggregated_histories.should.have.property('field-4');
        resB.body.aggregated_histories.should.have.property('field-5');
        resB.body.aggregated_histories.should.have.property('field-6');
        resB.body.aggregated_histories['field-1'].should.be.an('number').deep.equal(5);
        resB.body.aggregated_histories['field-2'].should.be.an('array').that.includes('text value 3', 'text value 4');
        resB.body.aggregated_histories['field-3'].should.be.an('array').deep.equal([5, 5, 5]);
        resB.body.aggregated_histories['field-4'].should.be.an('number').deep.equal(5);
        resB.body.aggregated_histories['field-5'].should.be.an('array').that.includes('another text value 3', 'another text value 4');
        resB.body.aggregated_histories['field-6'].should.be.an('array').deep.equal([5, 5, 5]);
     });

    it('it should GET all or filtered aggregated and grouped', async () => {        
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = []
        const topics = [
            {
                "name": "topic name 1",
                "description": "topic description 1",
                "unit":"unit1",
                "fields": [
                    { "name": "field-1", "description": "field description 1", "type": "scalar"},
                    { "name": "field-2", "description": "field description 2", "type": "text"},
                    { "name": "field-3", "description": "field description 3", "type": "vector"}
                ]
            },
            {
                "name": "topic name 2",
                "description": "topic description 2",
                "unit":"unit2",
                "fields": [
                    { "name": "field-4", "description": "field description 4", "type": "scalar"},
                    { "name": "field-5", "description": "field description 5", "type": "text"},
                    { "name": "field-6", "description": "field description 6", "type": "vector"}
                ]
            }
        ] 
        const protocol = await factory.createProtocol("test-protocol-1", "test-protocol-description-1", user, metadata, topics);
        const experiment1 = {
            "_id": "experiment_id1",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 1 },
                        { "name": "field-2", "value": "text value" },
                        { "name": "field-3", "value": [1, 1, 1] },
                        { "name": "field-4", "value": 1 },
                        { "name": "field-5", "value": "another text value" },
                        { "name": "field-6", "value": [1, 1, 1]  }
                    ]
                },
                {
                    "step": 2,
                    "timestamp": "2022-12-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 1 },
                        { "name": "field-2", "value": "text value 2" },
                        { "name": "field-3", "value": [1, 1] },
                        { "name": "field-4", "value": 1 },
                        { "name": "field-5", "value": "another text value 2" },
                        { "name": "field-6", "value": [1, 1, 1]  }
                    ]
                }
            ]
        }
        const experiment2 = {
            "_id": "experiment_id2",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 2 },
                        { "name": "field-2", "value": "text value 3" },
                        { "name": "field-3", "value": [2, 2, 2] },
                        { "name": "field-4", "value": 2 },
                        { "name": "field-5", "value": "another text value 3" },
                        { "name": "field-6", "value": [2, 2, 2]  }
                    ]
                }
            ]
        }
        const experiment3 = {
            "_id": "experiment_id3",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": [
                {
                    "step": 1,
                    "timestamp": "2022-09-15T18:15:17.396Z",
                    "fields": [
                        { "name": "field-1", "value": 3 },
                        { "name": "field-2", "value": "text value 4" },
                        { "name": "field-3", "value": [3, 3, 3] },
                        { "name": "field-4", "value": 3 },
                        { "name": "field-5", "value": "another text value 4" },
                        { "name": "field-6", "value": [3, 3, 3]  }
                    ]
                }
            ]
        }
        const experiment4 = {
            "_id": "experiment_id4",
            "description": "experiment description",
            "anonymization": true,
            "state": 1,
            "startDate": "2022-05-30T07:15:17.396Z",
            "endDate": "2022-09-15T18:15:17.396Z",
            "protocol": "test-protocol-1",
            "metadata": [],
            "history": []
        }
        const res0 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment1)
        res0.should.have.status(200);
        const res1 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment2)
        res1.should.have.status(200);
        const res2 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment3)
        res2.should.have.status(200);
        const res3 = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment4)
        res3.should.have.status(200);


        const res = await chai.request(server).keepOpen().get('/v1/experiments/aggregated_experiments?groups=True').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);  
        res.body.should.be.a('object');
        res.body.should.have.property('_ids');
        res.body.should.have.property('aggregated_histories');
        res.body._ids.should.be.an('array').that.includes('experiment_id1', 'experiment_id2', 'experiment_id3');
        res.body.aggregated_histories.should.have.property('topic name 1');
        res.body.aggregated_histories.should.have.property('topic name 2');
        res.body.aggregated_histories["topic name 1"].unit.should.be.an('string').deep.equal('unit1');
        res.body.aggregated_histories["topic name 2"].unit.should.be.an('string').deep.equal('unit2');
        res.body.aggregated_histories["topic name 1"].values.should.have.property('field-1');
        res.body.aggregated_histories["topic name 1"].values.should.have.property('field-2');
        res.body.aggregated_histories["topic name 1"].values.should.have.property('field-3');
        res.body.aggregated_histories["topic name 2"].values.should.have.property('field-4');
        res.body.aggregated_histories["topic name 2"].values.should.have.property('field-5');
        res.body.aggregated_histories["topic name 2"].values.should.have.property('field-6');
        res.body.aggregated_histories["topic name 1"].values['field-1'].should.be.an('number').deep.equal(7);
        res.body.aggregated_histories["topic name 1"].values['field-2'].should.be.an('array').that.includes('text value', 'text value 2', 'text value 3', 'text value 4');
        res.body.aggregated_histories["topic name 1"].values['field-3'].should.be.an('array').deep.equal([7, 7, 6]);
        res.body.aggregated_histories["topic name 2"].values['field-4'].should.be.an('number').deep.equal(7);
        res.body.aggregated_histories["topic name 2"].values['field-5'].should.be.an('array').that.includes('another text value', 'another text value 2', 'another text value 3', 'another text value 4');
        res.body.aggregated_histories["topic name 2"].values['field-6'].should.be.an('array').deep.equal([7, 7, 7]);

        const resB = await chai.request(server).keepOpen().get('/v1/experiments/aggregated_experiments?filter={"$or":[{"_id":"experiment_id2"},{"_id":"experiment_id3"}]}').set("Authorization", await factory.getUserToken(user));
        resB.should.have.status(200);  
        resB.body.should.be.a('object');
        resB.body.should.have.property('_ids');
        resB.body.should.have.property('aggregated_histories');
        resB.body._ids.should.be.an('array').that.includes('experiment_id2', 'experiment_id3');
        resB.body.aggregated_histories.should.have.property('field-1');
        resB.body.aggregated_histories.should.have.property('field-2');
        resB.body.aggregated_histories.should.have.property('field-3');
        resB.body.aggregated_histories.should.have.property('field-4');
        resB.body.aggregated_histories.should.have.property('field-5');
        resB.body.aggregated_histories.should.have.property('field-6');
        resB.body.aggregated_histories['field-1'].should.be.an('number').deep.equal(5);
        resB.body.aggregated_histories['field-2'].should.be.an('array').that.includes('text value 3', 'text value 4');
        resB.body.aggregated_histories['field-3'].should.be.an('array').deep.equal([5, 5, 5]);
        resB.body.aggregated_histories['field-4'].should.be.an('number').deep.equal(5);
        resB.body.aggregated_histories['field-5'].should.be.an('array').that.includes('another text value 3', 'another text value 4');
        resB.body.aggregated_histories['field-6'].should.be.an('array').deep.equal([5, 5, 5]);
     });
});
    

// Test the /POST route
describe('/POST experiment', () => {
    it('it should not POST a experiment without _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const experiment = {}
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should POST a experiment', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
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
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('metadata');
        res.body.should.have.property('history');
        res.body._id.should.be.eql(experiment._id);
        res.body.metadata.length.should.be.eql(3);
        res.body.history.length.should.be.eql(1);
        res.body.history[0].fields.length.should.be.eql(6);
    });

    it('it should POST an experiment with range values: scalar inside range and outside range', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "scalar" , range:[2,5]}]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "scalar" , range:[2,5]}]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment1 = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 3 }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 3 }]
            }],
            tags: []
        }
        let res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment1)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('metadata');
        res.body.should.have.property('history');
        res.body._id.should.be.eql(experiment1._id);
        res.body.metadata.length.should.be.eql(1);
        res.body.history.length.should.be.eql(1);
        res.body.history[0].fields.length.should.be.eql(1);
        
        //under min value
        const experiment2 = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 0 }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 3 }]
            }],
            tags: []
        }
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment2);        
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('metadata metadata-name-1 value 0 is not coherent with protocol range minimum value: 2');

        //over max value
        const experiment3 = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 10 }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 3 }]
            }],
            tags: []
        }
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment3)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('metadata metadata-name-1 value 10 is not coherent with protocol range maximum value: 5');
    });

    it('it should POST and NOT POST an experiment with range enumerable values ', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata-name-1", description: "description metadata 1", type: "enum" , range:["enum-test-1","enum-test-2"]}]
        const topics = [{
            name: "topic name 1", description: "topic description 1",
            fields: [{ name: "field-1", description: "field description 1", type: "enum" , range:["enum-test-1","enum-test-2"]}]
        }]
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment1 = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: "enum-test-1" }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: "enum-test-2" }]
            }],
            tags: []
        }
        let res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment1)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('metadata');
        res.body.should.have.property('history');
        res.body._id.should.be.eql(experiment1._id);
        res.body.metadata.length.should.be.eql(1);
        res.body.history.length.should.be.eql(1);
        res.body.history[0].fields.length.should.be.eql(1);
        
        //NOT an enumerable metadata value
        const experiment2 = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: "enum-fake-test" }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: "enum-test-1" }]
            }],
            tags: []
        }
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment2);        
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);        
        res.body.details.should.contain('metadata metadata-name-1 value enum-fake-test is not inside the range of enum values');

        //NOT an enumerable history value
        const experiment3 = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: "enum-test-1" }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: "enum-fake-test" }]
            }],
            tags: []
        }
        res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment3)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('field field-1 value enum-fake-test is not inside the range of enum values');
    });

    it('it should not POST a experiment with a duplicate metadata name', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-1", value: [765, 545] }],
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
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('metadata name duplicated ');
    });

    it('it should not POST a experiment with a duplicate history element field name', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
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
                { name: "field-2", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('history field name duplicated');
    });

    it('it should not POST a experiment with a duplicate history step', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
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
            },
            {
                step: 2, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            },
            {
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('history step duplicated');
    });

    it('it should not POST a experiment with a wrong metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 43 },
            { name: "metadata-fakename", value: "my string" },
            { name: "metadata-name-3", value: [765, 545] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            },
            {
                step: 2, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            },
            {
                step: 3, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('metadata metadata-fakename not found in protocol');
    });

    it('it should not POST a experiment with a wrong history field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
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
            },
            {
                step: 2, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-fake", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            },
            {
                step: 3, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('history field field-fake not found in protocol');
    });

    it('it should not POST a experiment with a wrong metadata value type', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: [23, 78] },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 78] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            },
            {
                step: 2, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            },
            {
                step: 3, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('is not coherent with protocol type');
    });

    it('it should not POST a experiment with a wrong history field value type', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
            description: "experiment description",
            state: 1,
            protocol: protocol._id,
            metadata: [{ name: "metadata-name-1", value: 23 },
            { name: "metadata-name-2", value: "my string" },
            { name: "metadata-name-3", value: [765, 78] }],
            history: [{
                step: 1, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: "fake-value" }]
            },
            {
                step: 2, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            },
            {
                step: 3, timestamp: Date.now(), fields: [{ name: "field-1", value: 32 },
                { name: "field-2", value: "my string" },
                { name: "field-3", value: [2, 3] },
                { name: "field-4", value: 45 },
                { name: "field-5", value: "my string 2" },
                { name: "field-6", value: [32, 543] }]
            }],
            tags: []
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('is not coherent with protocol type');
    });

    it('it should not POST a experiment with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
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
        await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key');
    });

    it('it should not POST a experiment with a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
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
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, metadata, topics);
        const experiment = {
            _id: "experiment name",
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
            tags: ["fake-tag"]
        }
        const res = await chai.request(server).keepOpen().post('/v1/experiments').set("Authorization", await factory.getUserToken(user)).send(experiment)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should POST a experiment loaded from CSV file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "scalar" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protoco-description-1", user, metadata, topics);
        const testFile = './test/dummies/testExperiment.csv';

        const res = await chai.request(server).keepOpen().post('/v1/experiments/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.experiments[0].should.have.property('_id');
        res.body.experiments[0].should.have.property('metadata');
        res.body.experiments[0].should.have.property('history');
        res.body.experiments[0].metadata.length.should.be.eql(2);
        res.body.experiments[0].history.length.should.be.eql(0);
    });

    it('it should POST a experiment loaded from CSV file with separator control', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 2", type: "vector" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "scalar" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protoco-description-1", user, metadata, topics);
        const testFile = './test/dummies/testExperimentInvertedSepSepArray.csv';

        const res = await chai.request(server).keepOpen().post('/v1/experiments/file?sep=;&sepArray=,').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.experiments[0].should.have.property('_id');
        res.body.experiments[0].should.have.property('metadata');
        res.body.experiments[0].should.have.property('history');
        res.body.experiments[0].metadata.length.should.be.eql(2);
        res.body.experiments[0].history.length.should.be.eql(0);
    });

    it('it should POST a experiment loaded from CSV file with separator control 2', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 2", type: "vector" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "scalar" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protoco-description-1", user, metadata, topics);
        const testFile = './test/dummies/testExperimentInvertedSepSepArraySepFloat.csv';

        const res = await chai.request(server).keepOpen().post('/v1/experiments/file?sep=;&sepArray=.&sepFloat=,').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.experiments[0].should.have.property('_id');
        res.body.experiments[0].should.have.property('metadata');
        res.body.experiments[0].should.have.property('history');
        res.body.experiments[0].metadata.length.should.be.eql(2);
        res.body.experiments[0].history.length.should.be.eql(0);
    });
});

// Test the /PUT route
describe('/PUT experiment', () => {
    it('it should PUT a experiment list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const tag_2 = await factory.createTag("test-tag-2", user, [], VisibilityTypes.public);
        const tag_3 = await factory.createTag("test-tag-3", user, [], VisibilityTypes.public);
        const tag_4 = await factory.createTag("test-tag-4", user, [], VisibilityTypes.public);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol, null, null, [tag_1._id, tag_2._id]);
        const request = { tags: { add: [tag_3._id, tag_4._id], remove: [tag_1._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('tags');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a experiment list of metadata to remove an item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const metadata_to_remove = experiment.metadata[1]
        const metadata_to_leave = experiment.metadata[0]
        const request = { metadata: { remove: [metadata_to_remove.name] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('metadata');
        res.body.metadata.length.should.be.eql(1);
        res.body.metadata[0].name.should.be.eql(metadata_to_leave.name);
    });

    it('it should PUT a experiment list of metadata to add an item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const metadata_to_remove = experiment.metadata[1]
        const metadata_to_leave = experiment.metadata[0]
        let request = { metadata: { remove: [metadata_to_remove.name] } };
        await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        const metadata_to_add = { name: metadata_to_remove.name, value: 34543354 }
        request = { metadata: { add: [metadata_to_add] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('metadata');
        res.body.metadata.length.should.be.eql(2);
        res.body.metadata[1].name.should.be.eql(metadata_to_add.name);
        res.body.metadata[1].value.should.be.eql(metadata_to_add.value);
    });

    it('it should PUT a experiment list of metadata to update an item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const metadata_to_update = experiment.metadata[1]
        const request = { metadata: { update: [{ name: metadata_to_update.name, new: { name: metadata_to_update.name, value: 99999 } }] } }
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('metadata');
        res.body.metadata.length.should.be.eql(2);
        res.body.metadata[1].name.should.be.eql(metadata_to_update.name);
        res.body.metadata[1].value.should.be.eql(99999);
    });

    it('it should not PUT a experiment list of metadata to update an item with a wrong name', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const metadata_to_update = experiment.metadata[1]
        const request = { metadata: { update: [{ name: metadata_to_update.name, new: { name: "fake_name", value: 99999 } }] } }
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('metadata fake_name not found in protocol');
    });

    it('it should not PUT a experiment list of metadata to update an item with a wrong value', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const metadata_to_update = experiment.metadata[1]
        const request = { metadata: { update: [{ name: metadata_to_update.name, new: { name: metadata_to_update.name, value: "fake-value" } }] } }
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('metadata value fake-value is not coherent with protocol type');
    });

    it('it should PUT a experiment list of metadata to add an wrong item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const metadata_to_remove = experiment.metadata[1]
        const metadata_to_leave = experiment.metadata[0]
        let request = { metadata: { remove: [metadata_to_remove.name] } };
        await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        const metadata_to_add = { name: "fake-name", value: 34543354 }
        request = { metadata: { add: [metadata_to_add] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('metadata fake-name not found in protocol');
    });

    it('it should PUT a experiment list of metadata to add an wrong value', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const metadata_to_remove = experiment.metadata[1]
        const metadata_to_leave = experiment.metadata[0]
        let request = { metadata: { remove: [metadata_to_remove.name] } };
        await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        const metadata_to_add = { name: metadata_to_remove.name, value: "fake-value" }
        request = { metadata: { add: [metadata_to_add] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('metadata value fake-value is not coherent with protocol type');
    });

    it('it should PUT experiment history to remove an item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_remove = experiment.history[1]
        const history_element_to_leave = experiment.history[0]
        const request = { history: { remove: [history_element_to_remove.step] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('history');
        res.body.history.length.should.be.eql(2);
        res.body.history[0].step.should.be.eql(history_element_to_leave.step);
    });

    it('it should PUT experiment history to add an item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_add = await factory.createExperimentHistory(protocol, 3, experiment.history.length)
        request = { history: { add: history_element_to_add } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('history');
        res.body.history.length.should.be.eql(6);
    });

    it('it should PUT NOT change history of a duplicate step without override', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_add = await factory.createExperimentHistory(protocol, 3, experiment.history.length)
        request = { history: { add: history_element_to_add } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        const history_element_to_add2 = await factory.createExperimentHistory(protocol, 3, experiment.history.length)
        request = { history: { add: history_element_to_add2 } };
        const res2 = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);

        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body.should.have.property('history');
        res2.body.history.length.should.be.eql(6);
        res2.body.history[3].fields[0].value.should.be.eql(history_element_to_add[0].fields[0].value);
        res2.body.history[4].fields[0].value.should.be.eql(history_element_to_add[1].fields[0].value);
        res2.body.history[5].fields[0].value.should.be.eql(history_element_to_add[2].fields[0].value);
        const expectedReport={ success: [], ignored: [3, 4, 5], overridden: [] }
        res2.body.report.should.be.eql(expectedReport);
    });

    it('it should PUT change history of a duplicate step with override', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_add = await factory.createExperimentHistory(protocol, 3, experiment.history.length)
        request = { history: { add: history_element_to_add } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        const history_element_to_add2 = await factory.createExperimentHistory(protocol, 3, experiment.history.length)
        request = { history: { add: history_element_to_add2 } };
        const res2 = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id+'?override=true').set("Authorization", await factory.getUserToken(user)).send(request);

        res2.should.have.status(200);
        res2.body.should.be.a('object');
        res2.body.should.have.property('history');
        res2.body.history.length.should.be.eql(6);
        res2.body.history[3].fields[0].value.should.be.eql(history_element_to_add2[0].fields[0].value);
        res2.body.history[4].fields[0].value.should.be.eql(history_element_to_add2[1].fields[0].value);
        res2.body.history[5].fields[0].value.should.be.eql(history_element_to_add2[2].fields[0].value);
        const expectedReport={ success: [], ignored: [], overridden: [3, 4, 5] };
        res2.body.report.should.be.eql(expectedReport);
    });

    it('it should PUT experiment history to update an item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_update = experiment.history[2]
        const history_element_updated = await factory.createExperimentHistory(protocol, 1, 2)
        const request = { history: { update: [{ step: history_element_to_update.step, new: history_element_updated[0] }] } }
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('history');
        res.body.history.length.should.be.eql(3);
        res.body.history[2].step.should.be.eql(history_element_updated[0].step);
    });

    it('it should not PUT experiment history to update an item with a wrong step', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_update = experiment.history[2]
        const history_element_updated = await factory.createExperimentHistory(protocol, 1, 2)
        const request = { history: { update: [{ step: 77, new: history_element_updated[0] }] } }
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('Embedded resource to be updates from list not found');
    });

    it('it should not PUT experiment history to update an item with a wrong name', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_update = experiment.history[2]
        const history_element_updated = await factory.createExperimentHistory(protocol, 1, 2)
        history_element_updated[0].fields[0].name = "fake_name";
        const request = { history: { update: [{ step: history_element_to_update.step, new: history_element_updated[0] }] } }
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('history field fake_name not found in protocol');
    });

    it('it should not PUT experiment history to update an item with a wrong value', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const history_element_to_update = experiment.history[2]
        const history_element_updated = await factory.createExperimentHistory(protocol, 1, 2)
        history_element_updated[0].fields[0].value = "fake_value";
        const request = { history: { update: [{ step: history_element_to_update.step, new: history_element_updated[0] }] } }
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('value fake_value in '+history_element_updated[0].fields[0].name+' is not coherent with protocol type');
    });

    it('it should PUT a experiment _id', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const request = { _id: "new-test-experiment-1" };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-experiment-1");
    });

    it('it should not PUT a experiment _id of a experiment already used in a measurement', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 1, null, null, null, protocol);
        const feature = await factory.createFeature("test-feature-2", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const tag = await factory.createTag("test-tag", user);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [], null, null, null, null, 'public', experiment, null);
        const request = { _id: "new-test-experiment-1" };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
    });

    it('it should PUT a experiment _id and change list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const tag_2 = await factory.createTag("test-tag-2", user, [], VisibilityTypes.public);
        const tag_3 = await factory.createTag("test-tag-3", user, [], VisibilityTypes.public);
        const tag_4 = await factory.createTag("test-tag-4", user, [], VisibilityTypes.public);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol, null, null, ['test-tag-1', 'test-tag-2']);
        const request = { _id: "new-test-experiment-1", tags: { add: ['test-tag-3', 'test-tag-4'], remove: ['test-tag-1'] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body._id.should.be.eql("new-test-experiment-1");
        res.body.should.have.property('tags');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should not PUT a experiment owner', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-2", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_1);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user_1, 0, null, null, null, protocol);
        const request = { owner: user_2._id };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_1)).send(request);
        res.should.have.status(errors.incorrect_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.incorrect_info.message);
    });

    it('it should not PUT a experiment as analyst', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { tags: { add: ['test-tag-1'], remove: [] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });

    it('it should not PUT a experiment of another provider', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_1);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user_1, 0, null, null, null, protocol);
        const tag = await factory.createTag("test-tag-1", user_1, [], VisibilityTypes.public);
        const request = { tags: { add: ['test-tag-1'], remove: [] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user_2)).send(request);
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
    });

    it('it should not PUT a experiment without any field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const request = {};
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not PUT a fake experiment', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { tags: { add: ['test-tag-1'], remove: [] } };
        const res = await chai.request(server).keepOpen().put('/v1/experiments/fake_protocol').set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /PUT CSV file route
describe('/PUT CSV file experiment', () => {
    it('it should PUT experiment history from csv file to add an item', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 1", type: "scalar" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protocol-description-1", user, metadata, topics);
        const metadatavalue = [{ name: "metadata1", value: 43 },
        { name: "metadata2", value: 5 }];
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description-1", user, 0, null, null, null, protocol, metadatavalue,[]);
        const testFile = './test/dummies/testExp1_step1_2.csv';
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id + '/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('history');
        res.body.history.length.should.be.eql(2);
        const expectedReport={ success: [ '1', '2' ], ignored: [], overridden: [] }
        res.body.report.should.be.eql(expectedReport);
    });

    it('it should PUT experiment history from csv file to add an item with Sep and SepArray inverted', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 1", type: "scalar" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protocol-description-1", user, metadata, topics);
        const metadatavalue = [{ name: "metadata1", value: 43 },
        { name: "metadata2", value: 5 }];
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description-1", user, 0, null, null, null, protocol, metadatavalue,[]);
        const testFile = './test/dummies/testExp1_step1_2InvertedSepSepArray.csv';
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id + '/file?sep=;&sepArray=,').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('history');
        res.body.history.length.should.be.eql(2);
        const expectedReport={ success: [ '1', '2' ], ignored: [], overridden: [] }
        res.body.report.should.be.eql(expectedReport);
    });

    it('it should PUT experiment history from csv file to add an item with Sep, SepArray, SepFloat inverted', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 1", type: "scalar" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protocol-description-1", user, metadata, topics);
        const metadatavalue = [{ name: "metadata1", value: 43 },
        { name: "metadata2", value: 5 }];
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description-1", user, 0, null, null, null, protocol, metadatavalue,[]);
        const testFile = './test/dummies/testExp1_step1_2InvertedSepSepArraySepFloat.csv';
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id + '/file?sep=;&sepArray=.&sepFloat=,').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('history');
        res.body.history.length.should.be.eql(2);
        const expectedReport={ success: [ '1', '2' ], ignored: [], overridden: [] }
        res.body.report.should.be.eql(expectedReport);
    });

    it('it should not PUT experiment history from csv file without steps', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 1", type: "scalar" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "scalar" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protocol-description-1", user, metadata, topics);
        const metadatavalue = [{ name: "metadata1", value: 43 },
        { name: "metadata2", value: 5 }];
        const experiment = await factory.createExperiment("test-experiment-1", "test-protocol-description-1", user, 0, null, null, null, protocol, metadatavalue,[]);
        const testFile = './test/dummies/testExp1_step_empty.csv';
        const res = await chai.request(server).keepOpen().put('/v1/experiments/' + experiment._id + '/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.file_history_empty.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.file_history_empty.message);        
    });

    it('it should POST and PUT experiment history from csv file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata = [{ name: "metadata1", description: "description metadata 1", type: "scalar" },
        { name: "metadata2", description: "description metadata 1", type: "vector" }]
        const topics = [{
            name: "topics1", description: "topic description 1",
            fields: [{ name: "field1", description: "field description 1", type: "scalar" }]
        },
        {
            name: "topics2", description: "topic description 1",
            fields: [{ name: "field2", description: "field description 2", type: "vector" }]
        }]
        const protocol = await factory.createProtocol("Test1", "test-protoco-description-1", user, metadata, topics);
        const testFile = './test/dummies/testExperiment.csv';

        const res = await chai.request(server).keepOpen().post('/v1/experiments/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));

        const testFile2 = './test/dummies/testExp1_step1_2.csv';
        const res2 = await chai.request(server).keepOpen().put('/v1/experiments/' + 'testExp1' + '/file').attach('file', testFile2).set("Authorization", await factory.getUserToken(user));
        res2.should.have.status(200);
        res2.body.should.be.a('object');        
        res2.body.should.have.property('history');        
        res2.body.should.have.property('metadata');
        res2.body.metadata.length.should.be.eql(2);
        res2.body.history.length.should.be.eql(2);
        const expectedReport={ success: [ '1', '2' ], ignored: [], overridden: [] }
        res2.body.report.should.be.eql(expectedReport);
    });
});

// Test the /DELETE route
describe('/DELETE experiment', () => {
    it('it should DELETE a experiment', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const experiments_before = await before.Experiment.find();
        experiments_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const experiments_after = await before.Experiment.find();
        experiments_after.length.should.be.eql(0);
    });

    it('it should not DELETE a experiment by non-owner', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const experiments_before = await before.Experiment.find();
        experiments_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.restricted_access_operation.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_operation.message);
        const experiments_after = await before.Experiment.find();
        experiments_after.length.should.be.eql(1);
    });

    it('it should not DELETE a fake experiment', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 0, null, null, null, protocol);
        const experiments_before = await before.Experiment.find();
        experiments_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/experiments/fake_protocol').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const experiments_after = await before.Experiment.find();
        experiments_after.length.should.be.eql(1);
    });

    it('it should not DELETE a experiment already used in a measurement', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 1, null, null, null, protocol);
        const feature = await factory.createFeature("test-feature-2", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const tag = await factory.createTag("test-tag", user);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [], null, null, null, null, 'public', experiment, null);
        const experiments_before = await before.Experiment.find();
        experiments_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/experiments/' + experiment._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const experiments_after = await before.Experiment.find();
        experiments_after.length.should.be.eql(1);
    });
});

