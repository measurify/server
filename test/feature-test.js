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

// Test the /GET route
describe('/GET feature', () => {
    it('it should GET all the features', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        await factory.createFeature("test-feature-1", user);
        await factory.createFeature("test-feature-2", user);
        const res = await chai.request(server).keepOpen().get('/v1/features').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific feature', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const res = await chai.request(server).keepOpen().get('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(feature._id.toString());
    });

    it('it should not GET a fake feature', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).keepOpen().get('/v1/features/fake-feature').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST feature', () => {
    it('it should not POST a feature without _id field', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = {}
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(feature)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply an _id');
    });

    it('it should POST a feature', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = {
            _id: "feature-name-text",
            items: [
                { name: "item-name-1", unit: "item-unit-1" },
                { name: "item-name-2", unit: "item-unit-2" },
                { name: "item-name-3", unit: "item-unit-3" }
            ]
        }
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(feature)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('items');
        res.body._id.should.be.eql(feature._id);
        res.body.items.length.should.be.eql(3);
    });

    it('it should not POST a feature with already existant _id field', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = { _id: "feature-name-text", owner: user };
        await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(feature)
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(feature)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('the _id is already used');
    });

    it('it should GET the feature posted before', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = {
            _id: "feature-name-text",
            items: [
                { name: "item-name-1", unit: "item-unit-1" },
                { name: "item-name-2", unit: "item-unit-2" },
                { name: "item-name-3", unit: "item-unit-3" }
            ]
        }
        await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(feature)
        const res = await chai.request(server).keepOpen().get('/v1/features').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(1);
        res.body.docs[0]._id.should.be.eql("feature-name-text");
    });

    it('it should POST a list of features', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const features = [{ _id: "test-text-1", dimensions: [] }, { _id: "test-text-2", dimensions: [] }];
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(features)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.features[0]._id.should.be.eql(features[0]._id);
        res.body.features[1]._id.should.be.eql(features[1]._id);
    });

    it('it should POST only not existing features from a list', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        let features = [{ _id: "test-text-1", dimensions: [] }, { _id: "test-text-2", dimensions: [] }];
        await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(features)
        features = [{ _id: "test-text-1", dimensions: [] }, { _id: "test-text-2", dimensions: [] },
        { _id: "test-text-3", dimensions: [] }, { _id: "test-text-4", dimensions: [] },
        { _id: "test-text-5", dimensions: [] }];
        const res = await chai.request(server).keepOpen().post('/v1/features').set("Authorization", await factory.getUserToken(user)).send(features)
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.features.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
        res.body.errors[0].should.contain(features[0]._id);
        res.body.errors[1].should.contain(features[1]._id);
        res.body.features[0]._id.should.be.eql(features[2]._id);
        res.body.features[1]._id.should.be.eql(features[3]._id);
        res.body.features[2]._id.should.be.eql(features[4]._id);
    });
});

// Test the /POST file route
describe('/POST feature from file', () => {
    it('it should POST a feature from file csv compact way', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("tag1", user);
        const tag2 = await factory.createTag("tag2", user);
        const testFile = './test/test/feature_test.csv';
        
        
        const res = await chai.request(server).keepOpen().post('/v1/features/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('features');
        res.body.features.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(0);        
        res.body.features[0].should.have.property('items');
        res.body.features[0].should.have.property('tags');
        res.body.features[0].should.have.property('visibility');
        res.body.features[0].should.have.property('_id');
        res.body.features[1].should.have.property('items');
        res.body.features[1].should.have.property('tags');
        res.body.features[1].should.have.property('visibility');
        res.body.features[1].should.have.property('_id');
        res.body.features[0]._id.should.be.eql("feature_test_1");
        res.body.features[1]._id.should.be.eql("feature_test_2");
        res.body.features[1].tags.length.should.be.eql(2);
        res.body.features[0].tags.length.should.be.eql(0);
        res.body.features[0].items.length.should.be.eql(1);        
        res.body.features[1].items.length.should.be.eql(2);
        res.body.features[1].items[0].type.should.be.eql("number");        
        res.body.features[1].items[0].dimension.should.be.eql(0);
    });

    it('it should POST a feature from another file csv ', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("tag1", user);
        const tag2 = await factory.createTag("tag2", user);
        const tag3 = await factory.createTag("tag3", user);
        const testFile = './test/test/MultiFeatureTags.csv';
        
        
        const res = await chai.request(server).keepOpen().post('/v1/features/file').attach('file', testFile).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('features');
        res.body.features.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(0);        
        res.body.features[0].should.have.property('items');
        res.body.features[0].should.have.property('tags');
        res.body.features[0].should.have.property('visibility');
        res.body.features[0].should.have.property('_id');
        res.body.features[1].should.have.property('items');
        res.body.features[1].should.have.property('tags');
        res.body.features[1].should.have.property('visibility');
        res.body.features[1].should.have.property('_id');
        res.body.features[0]._id.should.be.eql("myFeat1");
        res.body.features[1]._id.should.be.eql("myFeat2");
        res.body.features[0].tags.length.should.be.eql(3);
        res.body.features[1].tags.length.should.be.eql(1);
        res.body.features[0].items.length.should.be.eql(5);        
        res.body.features[1].items.length.should.be.eql(6);
        res.body.features[0].items[1].type.should.be.eql("number");        
        res.body.features[0].items[1].dimension.should.be.eql(1);
    });
});


// Test the /DELETE route
describe('/DELETE feature', () => {
    it('it should DELETE a feature', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const features_before = await before.Feature.find();
        features_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const features_after = await before.Feature.find();
        features_after.length.should.be.eql(0);
    });

    it('it should not DELETE a feature by non-owner', async () => {     
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2 = await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-1", user);
        const features_before = await before.Feature.find();
        features_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
        const features_after = await before.Feature.find();
        features_after.length.should.be.eql(1);
    });

    it('it should not DELETE a fake feature', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const features_before = await before.Feature.find();
        features_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/features/fake_feature').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const features_after = await before.Feature.find();
        features_after.length.should.be.eql(1);
    });
    
    it('it should not DELETE a feature already used in a measurement', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const tag = await factory.createTag("test-tag", user);
        const thing = await factory.createThing("test-thing-2", user);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag]);
        const features_before = await before.Feature.find();
        features_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const features_after = await before.Feature.find();
        features_after.length.should.be.eql(1);
    });

    it('it should not DELETE a feature already used in a device', async () => {      
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature-2", user);
        const device = await factory.createDevice("test-device-2", user, [feature]);
        const features_before = await before.Feature.find();
        features_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/features/' + feature._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.already_used.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.already_used.message);
        const features_after = await before.Feature.find();
        features_after.length.should.be.eql(1);
    });
});
