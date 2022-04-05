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
const errors = require('../commons/errors.js');
const ItemTypes = require('../types/itemTypes.js');
chai.use(chaiHttp);
const before = require('./before-test.js');


// Test the /GET route
describe('/GET dataset', () => {  
    it('it should GET all the measurements as pd dataframe', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(3));
        const res = await chai.request(server).keepOpen().get('/v1/dataset').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body[0].id.should.be.a('array');
        res.body[0].id.length.should.be.eql(3);
    });

    it('it should GET all the measurements as CSV', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(3));
        const res = await chai.request(server).keepOpen().get('/v1/dataset').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv');
        res.should.have.status(200);
        res.text.should.be.a('string');
        res.text.should.include('"visibility","tags","_id","startDate","endDate","thing","feature","device","values","deltatime"');
    });

    it('it should GET all the measurements as CSV+', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(3));
        const res = await chai.request(server).keepOpen().get('/v1/dataset?filter={"feature":"test-feature"}').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv+');
        res.should.have.status(200);
        res.text.should.be.a('string');
        res.text.should.contain('"visibility","tags","_id","startDate","endDate","location","thing","feature","device","item-name-1","deltatime"');
    });

    it('it should GET measurements paginated', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(3));
        const measurement4 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(4));
        const res = await chai.request(server).keepOpen().get('/v1/dataset?limit=2&page=1').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body[0].id.should.be.a('array');
        res.body[0].id.length.should.be.eql(2);
    });

    it('it should GET measurements only of a specific tag', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(3));
        const measurement4 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(4));
        const measurement5 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(5));
        let res = await chai.request(server).keepOpen().get('/v1/dataset?filter={"tags":"test-tag-1"}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body[0].id.should.be.a('array');
        res.body[0].id.length.should.be.eql(4);
        res = await chai.request(server).keepOpen().get('/v1/dataset?filter={"tags":"test-tag-2"}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body[0].id.should.be.a('array');
        res.body[0].id.length.should.be.eql(2);
    });

    it('it should GET the same feature as id and filter', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const tag1 = await factory.createTag("test-tag-1", owner);
        const tag2 = await factory.createTag("test-tag-2", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag1, tag2], factory.createSamples(3));
        const res = await chai.request(server).keepOpen().get('/v1/dataset?filter={"feature":"'+feature._id+'"}').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body[0].id.should.be.a('array');
        res.body[0].id.length.should.be.eql(3);
    });

    it('it should GET measurements only of a specific dataupload tag as pd Dataframe', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const dataupload1 = await factory.createDataupload("test-dataupload-1", owner);
        const dataupload2 = await factory.createDataupload("test-dataupload-2", owner);
        const tag1 = await factory.createTag(dataupload1._id, owner);
        const tag2 = await factory.createTag(dataupload2._id, owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag2], factory.createSamples(3));
        const measurement4 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(4));
        const measurement5 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(5));
        let res = await chai.request(server).keepOpen().get('/v1/dataset/'+dataupload1._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body[0].id.should.be.a('array');
        res.body[0].id.length.should.be.eql(3);
        res = await chai.request(server).keepOpen().get('/v1/dataset/'+dataupload2._id).set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body[0].id.should.be.a('array');
        res.body[0].id.length.should.be.eql(2);
    });

    it('it should GET measurements only of a specific dataupload tag as CSV', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const dataupload1 = await factory.createDataupload("test-dataupload-1", owner);
        const dataupload2 = await factory.createDataupload("test-dataupload-2", owner);
        const tag1 = await factory.createTag(dataupload1._id, owner);
        const tag2 = await factory.createTag(dataupload2._id, owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag2], factory.createSamples(3));
        const measurement4 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(4));
        const measurement5 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(5));
        let res = await chai.request(server).keepOpen().get('/v1/dataset/'+dataupload1._id).set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv');
        res.should.have.status(200);
        res.text.should.be.a('string');
        res.text.should.contain('"visibility","tags","_id","startDate","endDate","thing","feature","device","values","deltatime"');
        res = await chai.request(server).keepOpen().get('/v1/dataset/'+dataupload2._id).set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv');
        res.should.have.status(200);
        res.text.should.be.a('string');
        res.text.should.contain('"visibility","tags","_id","startDate","endDate","thing","feature","device","values","deltatime"');
    });

    it('it should GET measurements only of a specific dataupload tag as CSV+', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const device = await factory.createDevice("test-device-1", owner, [feature]);
        const thing = await factory.createThing("test-thing-1", owner);
        const dataupload1 = await factory.createDataupload("test-dataupload-1", owner);
        const dataupload2 = await factory.createDataupload("test-dataupload-2", owner);
        const tag1 = await factory.createTag(dataupload1._id, owner);
        const tag2 = await factory.createTag(dataupload2._id, owner);
        const measurement1 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(1));
        const measurement2 = await factory.createMeasurement(owner, feature, device, thing, [tag2], factory.createSamples(2));
        const measurement3 = await factory.createMeasurement(owner, feature, device, thing, [tag2], factory.createSamples(3));
        const measurement4 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(4));
        const measurement5 = await factory.createMeasurement(owner, feature, device, thing, [tag1], factory.createSamples(5));
        let res = await chai.request(server).keepOpen().get('/v1/dataset/'+dataupload1._id+'?filter={"feature":"test-feature"}').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv+');
        res.should.have.status(200);
        res.text.should.be.a('string');
        res.text.should.contain('"visibility","tags","_id","startDate","endDate","location","thing","feature","device","item-name-1","deltatime"');
        res = await chai.request(server).keepOpen().get('/v1/dataset/'+dataupload2._id+'?filter={"feature":"test-feature"}').set("Authorization", await factory.getUserToken(owner)).set('Accept', 'text/csv+');
        res.should.have.status(200);
        res.text.should.be.a('string');
        res.text.should.contain('"visibility","tags","_id","startDate","endDate","location","thing","feature","device","item-name-1","deltatime"');
    });

    it('it should GET info of the dataupload', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", owner);
        const dataupload = await factory.createDataupload("test-dataupload", owner,Date.now(),1500,"test-result",Date.now());
        let res = await chai.request(server).keepOpen().get('/v1/dataset/'+dataupload._id+'/info').set("Authorization", await factory.getUserToken(owner));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.contain(dataupload._id);
        res.body.results.should.contain("test-result");
        res.body.size.should.be.eql(1500);
    });

});

// Test the /POST route
describe('/POST dataset', () => {
    it('it should POST a dataset from correct one row CSV', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file1.txt';
        const testDescription = './test/test/test-description.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('completed');
        res.body.should.have.property('errors');
        res.body.completed.length.should.be.eql(1);
        res.body.errors.length.should.be.eql(0);        
    });

    it('it should POST a dataset from CSV some row correct and some not', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file2.txt';
        const testDescription = './test/test/test-description.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.should.have.property('completed');
        res.body.should.have.property('errors');
        res.body.completed.length.should.be.eql(2);
        res.body.errors.length.should.be.eql(7);
        res.body.completed[0].should.be.eql('0');
        res.body.completed[1].should.be.eql('7');
        res.body.errors[0].should.be.eql('Index: 1 (thing fake-thing not found in database)');
        res.body.errors[1].should.be.eql('Index: 2 (device fake-device not found in database)');
        res.body.errors[2].should.be.eql('Index: 3 (not enough fields in the row)');
        res.body.errors[3].should.be.eql('Index: 4 (startdate is not in Date format)');
        res.body.errors[4].should.be.eql('Index: 5 (tag fake-tag not found in database)'); 
        res.body.errors[5].should.be.eql('Index: 6 (enddate is not in Date format)');
        res.body.errors[6].should.be.eql('Index: 8 (expected number in samples at position 0)');       
    });

    it('it should POST a dataset from CSV with force = true and the object not found in database will be created', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file2.txt';
        const testDescription = './test/test/test-description.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.should.have.property('completed');
        res.body.should.have.property('errors');
        res.body.completed.length.should.be.eql(5);
        res.body.errors.length.should.be.eql(4);
        res.body.completed[0].should.be.eql('0');
        res.body.completed[1].should.be.eql('1');
        res.body.completed[2].should.be.eql('2');
        res.body.completed[3].should.be.eql('5');
        res.body.completed[4].should.be.eql('7');
        res.body.errors[0].should.be.eql('Index: 3 (not enough fields in the row)');
        res.body.errors[1].should.be.eql('Index: 4 (startdate is not in Date format)');        
        res.body.errors[2].should.be.eql('Index: 6 (enddate is not in Date format)');
        res.body.errors[3].should.be.eql('Index: 8 (expected number in samples at position 0)');       
    });
    
    it('it should not POST a dataset with a wrong description file', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file2.txt';
        const testDescription = './test/test/test-fake-description.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.description_not_json.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');        
        res.body.message.should.contain(errors.description_not_json.message);       
    });

    //with multiple features
    it('it should POST a dataset from correct one row CSV with multiple features', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file1-multiple-features.txt';
        const testDescription = './test/test/test-description-multiple-features.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('completed');
        res.body.should.have.property('errors');
        res.body.completed.length.should.be.eql(1);
        res.body.errors.length.should.be.eql(0);        
    });

    it('it should POST a dataset from CSV with multiple features some row correct and some not', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file2-multiple-features.txt';
        const testDescription = './test/test/test-description-multiple-features.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(202);
        console.log(res.body);
        res.body.should.be.a('object');
        res.body.should.have.property('completed');
        res.body.should.have.property('errors');
        res.body.completed.length.should.be.eql(1);
        res.body.errors.length.should.be.eql(8);
        res.body.completed[0].should.be.eql('0');
        res.body.errors[0].should.be.eql('Index: 1 (thing fake-thing not found in database)');
        res.body.errors[1].should.be.eql('Index: 2 (device fake-device not found in database)');
        res.body.errors[2].should.be.eql('Index: 3 (not enough fields in the row)');
        res.body.errors[3].should.be.eql('Index: 4 (startdate is not in Date format)');
        res.body.errors[4].should.be.eql('Index: 5 (tag fake-tag not found in database)'); 
        res.body.errors[5].should.be.eql('Index: 6 (enddate is not in Date format)');
        res.body.errors[6].should.be.eql('Index: 7 (feature bad-feature not found in database)');
        res.body.errors[7].should.be.eql('Index: 8 (expected number in samples at position 0)');       
    });

    it('it should POST a dataset from CSV with multiple features with force = true and the object not found in database will be created', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file2-multiple-features.txt';
        const testDescription = './test/test/test-description-multiple-features.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.should.have.property('completed');
        res.body.should.have.property('errors');
        res.body.completed.length.should.be.eql(4);
        res.body.errors.length.should.be.eql(5);
        res.body.completed[0].should.be.eql('0');
        res.body.completed[1].should.be.eql('1');
        res.body.completed[2].should.be.eql('2');
        res.body.completed[3].should.be.eql('5');
        res.body.errors[0].should.be.eql('Index: 3 (not enough fields in the row)');
        res.body.errors[1].should.be.eql('Index: 4 (startdate is not in Date format)');        
        res.body.errors[2].should.be.eql('Index: 6 (enddate is not in Date format)');
        res.body.errors[3].should.be.eql('Index: 7 (feature bad-feature not found in database)');
        res.body.errors[4].should.be.eql('Index: 8 (expected number in samples at position 0)');       
    });
    
    it('it should not POST a dataset with a wrong description file with multiple features', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag1 = await factory.createTag("test-tag-1", user);
        const tag2 = await factory.createTag("test-tag-2", user);
        const feature = await factory.createFeature("test-feature", user);
        const device1 = await factory.createDevice("test-device-1", user, [feature]);
        const device2 = await factory.createDevice("test-device-2", user, [feature]);
        const thing1 = await factory.createThing("test-thing-1", user);
        const testFile = './test/test/test-file2-multiple-features.txt';
        const testDescription = './test/test/test-fake-description.txt';
        
        const res = await chai.request(server).keepOpen().post('/v1/dataset?force=true').attach('file', testFile).attach('description', testDescription).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.description_not_json.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');        
        res.body.message.should.contain(errors.description_not_json.message);       
    });
});

// Test the /DELETE route
describe('/DELETE dataset', () => {
    it('it should DELETE a dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const device = await factory.createDevice("test-device-4", user, [feature]);
        const thing = await factory.createThing("test-thing", user);
        const dataupload1 = await factory.createDataupload("test-dataupload-1", owner);
        const tag1 = await factory.createTag(dataupload1._id, owner);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag1]);
        const measurements_before = await before.Measurement.find();
        measurements_before.length.should.be.eql(1);
        const datauploads_before = await before.Dataupload.find();
        datauploads_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/dataset/'+dataupload1._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const measurements_after = await before.Measurement.find();
        measurements_after.length.should.be.eql(0);
        const datauploads_after = await before.Dataupload.find();
        datauploads_after.length.should.be.eql(0);
    });

    it('it should not DELETE a fake dataset', async () => {
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const feature = await factory.createFeature("test-feature", user);
        const device = await factory.createDevice("test-device-4", user, [feature]);
        const thing = await factory.createThing("test-thing", user);
        const dataupload1 = await factory.createDataupload("test-dataupload-1", owner);
        const tag1 = await factory.createTag(dataupload1._id, owner);
        const measurement = await factory.createMeasurement(user, feature, device, thing, [tag1]);
        const measurements_before = await before.Measurement.find();
        measurements_before.length.should.be.eql(1);
        const datauploads_before = await before.Dataupload.find();
        datauploads_before.length.should.be.eql(1);
        const res = await chai.request(server).keepOpen().delete('/v1/dataset/fake_measurement').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const measurements_after = await before.Measurement.find();
        measurements_after.length.should.be.eql(1);
        const datauploads_after = await before.Dataupload.find();
        datauploads_after.length.should.be.eql(1);
    });
});
