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

// Test the /GET route

describe('/GET protocol', () => {
    it('it should GET all the protocols', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        await factory.createProtocol("test-protocol-2", "test-protoco-description-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/protocols').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific protocol', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol", "test-protoco-description", user);
        const res = await chai.request(server).keepOpen().get('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(protocol._id.toString());
    });

    it('it should not GET a fake protocol', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/protocols/fake-protocol').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST protocol', () => {
    it('it should not POST a protocol without _id field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = {}
        const res = await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocol)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should POST a protocol', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = {
            _id: "protocol name",
            description: "protocol description",
            metadata: [ { name: "metadata-name-1", description: "description metadata 1", type: "scalar"} ],
            topics: [ { name: "topic name 1", description: "topic description 1", 
                        fields: [ { name: "field-1", description: "field description 1", type: "scalar"} ] },] 
        }
        const res = await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocol)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('metadata');
        res.body.should.have.property('topics');
        res.body._id.should.be.eql(protocol._id);
        res.body.metadata.length.should.be.eql(1);
    });

    it('it should not POST a protocol with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = {
            _id: "protocol name",
            description: "protocol description",
            metadata: [ { name: "metadata-name-1", description: "description metadata 1", type: "scalar"} ],
            topics: [ { name: "topic name 1", description: "topic description 1", 
                        fields: [ { name: "field-1", description: "field description 1", type: "scalar"} ] },] 
        }
        await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocol)
        const res = await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocol)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('duplicate key');
    });

    it('it should not POST a protocol with a fake tag', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = {
            _id: "protocol name",
            description: "protocol description",
            metadata: [ { name: "metadata-name-1", description: "description metadata 1", type: "scalar"} ],
            topics: [ { name: "topic name 1", description: "topic description 1", 
                        fields: [ { name: "field-1", description: "field description 1", type: "scalar"} ] },],
            tags: [ "fake-tag"] 
        }
        const res = await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocol)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should GET the protocol posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = {
            _id: "protocol-name-text",
            description: "protocol description",
            metadata: [ { name: "metadata-name-1", description: "description metadata 1", type: "scalar"} ],
            topics: [ { name: "topic name 1", description: "topic description 1", 
                        fields: [ { name: "field-1", description: "field description 1", type: "scalar"} ] },] 
        }
        await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocol)
        const res = await chai.request(server).keepOpen().get('/v1/protocols').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("protocol-name-text");
    });

    it('it should POST a list of protocols', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocols = [{ _id: "test-text-1" }, { _id: "test-text-2" }];
        const res = await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocols)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.protocols[0]._id.should.be.eql(protocols[0]._id);
        res.body.protocols[1]._id.should.be.eql(protocols[1]._id);
    });

    it('it should POST only not existing protocols from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        let protocols = [{ _id: "test-text-1" }, { _id: "test-text-2" }];
        await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocols)
        protocols = [{ _id: "test-text-1" }, { _id: "test-text-2" },
        { _id: "test-text-3" }, { _id: "test-text-4" },
        { _id: "test-text-5" }];
        const res = await chai.request(server).keepOpen().post('/v1/protocols').set("Authorization", await factory.getUserToken(user)).send(protocols)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.protocols.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain(protocols[0]._id);
        res.body.errors[1].should.contain(protocols[1]._id);
        res.body.protocols[0]._id.should.be.eql(protocols[2]._id);
        res.body.protocols[1]._id.should.be.eql(protocols[3]._id);
        res.body.protocols[2]._id.should.be.eql(protocols[4]._id);
    });

    it('it should POST protocol loaded from JSON file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);                
        const testFile = './test/test/testProtocol.json';

        const res = await chai.request(server).keepOpen().post('/v1/protocols/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);        
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('metadata');
        res.body.should.have.property('topics');
        res.body.should.have.property('description');        
        res.body.metadata.length.should.be.eql(2);
        res.body.topics.length.should.be.eql(2);        
    });


    it('it should POST protocol 1 loaded from CSV file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);                
        const testFile = './test/test/testProtocol.csv';

        const res = await chai.request(server).keepOpen().post('/v1/protocols/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.protocols[0].should.have.property('_id');
        res.body.protocols[0].should.have.property('metadata');
        res.body.protocols[0].should.have.property('topics');
        res.body.protocols[0].should.have.property('description');        
        res.body.protocols[0].metadata.length.should.be.eql(2);
        res.body.protocols[0].topics.length.should.be.eql(2);
    });

    it('it should POST protocol 2 loaded from CSV file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);                
        const testFile = './test/test/testProtocol2.csv';

        const res = await chai.request(server).keepOpen().post('/v1/protocols/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.protocols[0].should.have.property('_id');
        res.body.protocols[0].should.have.property('metadata');
        res.body.protocols[0].should.have.property('topics');
        res.body.protocols[0].should.have.property('description');        
        res.body.protocols[0].metadata.length.should.be.eql(2);
        res.body.protocols[0].topics.length.should.be.eql(2);
    });

    it('it should POST protocol 3 loaded from CSV file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);                
        const testFile = './test/test/testProtocol3.csv';

        const res = await chai.request(server).keepOpen().post('/v1/protocols/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.protocols[0].should.have.property('_id');
        res.body.protocols[0].should.have.property('metadata');
        res.body.protocols[0].should.have.property('topics');
        res.body.protocols[0].should.have.property('description');  
        res.body.protocols[0].metadata.length.should.be.eql(4);
        res.body.protocols[0].topics.length.should.be.eql(2);
        res.body.protocols[0].topics[0].fields.length.should.be.eql(3);        
        res.body.protocols[0].topics[1].fields.length.should.be.eql(2);
    });

    it('it should POST protocol 4 loaded from CSV file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);                
        const testFile = './test/test/testProtocol4.csv';

        const res = await chai.request(server).keepOpen().post('/v1/protocols/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.protocols[0].should.have.property('_id');
        res.body.protocols[0].should.have.property('metadata');
        res.body.protocols[0].should.have.property('topics');
        res.body.protocols[0].should.have.property('description');        
        res.body.protocols[0].metadata.length.should.be.eql(4);
        res.body.protocols[0].topics.length.should.be.eql(2);        
        res.body.protocols[0].topics[0].fields.length.should.be.eql(5);        
        res.body.protocols[0].topics[1].fields.length.should.be.eql(4);
    });
});

// Test the /PUT route
describe('/PUT protocol', () => {   
    it('it should PUT a protocol list of tags', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag_1 = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const tag_2 = await factory.createTag("test-tag-2", user, [], VisibilityTypes.public);
        const tag_3 = await factory.createTag("test-tag-3", user, [], VisibilityTypes.public);
        const tag_4 = await factory.createTag("test-tag-4", user, [], VisibilityTypes.public);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, [], [], [tag_1._id, tag_2._id]);
        const request = { tags: { add: [tag_3._id, tag_4._id], remove: [tag_1._id] } };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('tags');
        res.body.tags.length.should.be.eql(3);
    });

    it('it should PUT a protocol list of metadata', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata_1 = await factory.createMetadata("test-metadata-1", "test-metadata-description-1", "scalar");
        const metadata_2 = await factory.createMetadata("test-metadata-2", "test-metadata-description-2", "scalar");
        const metadata_3 = await factory.createMetadata("test-metadata-3", "test-metadata-description-3", "scalar");
        const metadata_4 = await factory.createMetadata("test-metadata-4", "test-metadata-description-4", "scalar");
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, [metadata_1, metadata_2], [], []);
        const request = { metadata: { add: [metadata_3, metadata_4], remove: [metadata_1.name] } };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('metadata');
        res.body.metadata.length.should.be.eql(3);
    });

    it('it should PUT a metadata of a protocol', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata_1 = await factory.createMetadata("test-metadata-1", "test-metadata-description-1", "scalar");
        const metadata_2 = await factory.createMetadata("test-metadata-2", "test-metadata-description-2", "scalar");
        const metadata_3 = await factory.createMetadata("test-metadata-3", "test-metadata-description-3", "scalar");
        const metadata_4 = await factory.createMetadata("test-metadata-4", "test-metadata-description-4", "scalar");
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, [metadata_1, metadata_2, metadata_3, metadata_4 ], [], []);
        const request = { metadata: { update: [ { name: metadata_3.name,  new: { name: "metadata-name-3-new", description: "description metadata 3", type: "vector" }},
                                                { name: metadata_1.name,  new: { name: "metadata-name-1-new", description: "description metadata 1", type: "scalar" }}]}}
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('metadata');
        res.body.metadata.length.should.be.eql(4);
        res.body.metadata[0].name.should.be.eql('metadata-name-1-new');
        res.body.metadata[1].name.should.be.eql('test-metadata-2');
        res.body.metadata[2].name.should.be.eql('metadata-name-3-new');
        res.body.metadata[3].name.should.be.eql('test-metadata-4');
    });

    it('it should not PUT a metadata of a protocol with a fake type', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const metadata_1 = await factory.createMetadata("test-metadata-1", "test-metadata-description-1", "scalar");
        const metadata_2 = await factory.createMetadata("test-metadata-2", "test-metadata-description-2", "scalar");
        const metadata_3 = await factory.createMetadata("test-metadata-3", "test-metadata-description-3", "scalar");
        const metadata_4 = await factory.createMetadata("test-metadata-4", "test-metadata-description-4", "scalar");
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, [metadata_1, metadata_2, metadata_3, metadata_4 ], [], []);
        const request = { metadata: { update: [ { name: metadata_3.name,  new: { name: "metadata-name-3-new", description: "description metadata 3", type: "fake-type" }},
                                                { name: metadata_1.name,  new: { name: "metadata-name-1-new", description: "description metadata 1", type: "scalar" }}]}}
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.put_request_error.status);
        res.body.should.be.a('object');
        res.body.details.should.contain('fake-type');
    });

    it('it should PUT a protocol _id', async () => {
      const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
       const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
       const request = { _id: "new-test-protocol-1" };
       const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
       res.should.have.status(200);
       res.body.should.be.a('object');
       res.body.should.have.property('_id');
       res.body._id.should.be.eql("new-test-protocol-1");
    });

    it('it should not PUT a protocol _id of a protocol already used in an experiment', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 1, null, null, null, protocol);        
        const request = { _id: "new-test-protocol-1" };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message); 
    });
    
    it('it should PUT a protocol _id and change list of tags', async () => {
       const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);        
       const tag_1 = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
       const tag_2 = await factory.createTag("test-tag-2", user, [], VisibilityTypes.public);
       const tag_3 = await factory.createTag("test-tag-3", user, [], VisibilityTypes.public);
       const tag_4 = await factory.createTag("test-tag-4", user, [], VisibilityTypes.public);
       const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user, [], [], ['test-tag-1', 'test-tag-2']);
       const request = { _id:"new-test-protocol-1",tags: { add: ['test-tag-3', 'test-tag-4'], remove: ['test-tag-1'] } };
       const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
       res.should.have.status(200);
       res.body.should.be.a('object');
       res.body.should.have.property('_id');
       res.body._id.should.be.eql("new-test-protocol-1");
       res.body.should.have.property('tags');
       res.body.tags.length.should.be.eql(3);
    });

    it('it should not PUT a protocol owner', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-2", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_1);        
        const request = { owner: user_2._id };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user_1)).send(request);
        res.should.have.status(errors.incorrect_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.incorrect_info.message);
    });

    it('it should not PUT a protocol as analyst', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.analyst);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);        
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);
        const request = { tags: { add: ['test-tag-1'], remove: [] } };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not PUT a protocol of another provider', async () => {
        const user_1 = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user_2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user_1); 
        const tag = await factory.createTag("test-tag-1", user_1, [], VisibilityTypes.public);        
        const request = { tags: { add: ['test-tag-1'], remove: [] } };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user_2)).send(request);
        res.should.have.status(errors.restricted_access_modify.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.restricted_access_modify.message);
    });

    it('it should not PUT a protocol without any field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);        
        const request = { };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.missing_info.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.missing_info.message);
    });

    it('it should not PUT a fake protocol', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user);    
        const tag = await factory.createTag("test-tag-1", user, [], VisibilityTypes.public);       
        const request = { tags: { add: ['test-tag-1'], remove: [] } };
        const res = await chai.request(server).keepOpen().put('/v1/protocols/fake_protocol').set("Authorization", await factory.getUserToken(user)).send(request);
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /DELETE route
describe('/DELETE protocol', () => {
    it('it should DELETE a protocol', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user); 
        const protocols_before = await before.Protocol.find();
        protocols_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const protocols_after = await before.Protocol.find();
        protocols_after.length.should.be.eql(0);
    });

    it('it should not DELETE a protocol by non-owner', async () => {     
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user); 
        const protocols_before = await before.Protocol.find();
        protocols_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
        const protocols_after = await before.Protocol.find();
        protocols_after.length.should.be.eql(1);
    });

    it('it should not DELETE a fake protocol', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user); 
        const protocols_before = await before.Protocol.find();
        protocols_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/protocols/fake_protocol').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const protocols_after = await before.Protocol.find();
        protocols_after.length.should.be.eql(1);
    });
    
    it('it should not DELETE a protocol already used in a experiment', async () => {  
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const protocol = await factory.createProtocol("test-protocol-1", "test-protoco-description-1", user); 
        const experiment = await factory.createExperiment("test-experiment-1", "test-protoco-description-1", user, 1, null, null, null, protocol);        
        const protocols_before = await before.Protocol.find();
        protocols_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/protocols/' + protocol._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const protocols_after = await before.Protocol.find();
        protocols_after.length.should.be.eql(1);  
    });
});

