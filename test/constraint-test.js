// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const User = mongoose.model('User');
const Constraint = mongoose.model('Constraint');
const UserRoles = require('../models/UserRoles.js');
const errors = require('../commons/errors.js');
const RelationshipTypes = require('../models/relationshipTypes.js');

chai.use(chaiHttp);

// Test the /GET route
describe('/GET constraint', () => {
    it('it should GET all the constraint', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        await factory.createConstraint(user, "Tag", "Feature", tag._id, feature._id, RelationshipTypes.dependency);
        await factory.createConstraint(user, "Feature", "Tag", feature._id, tag._id, RelationshipTypes.dependency);
        const res = await chai.request(server).get('/v1/constraints').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(2);
    });

    it('it should GET a specific constraint', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = await factory.createConstraint(user, "Tag", "Feature", tag._id, feature._id, RelationshipTypes.dependency);
        const res = await chai.request(server).get('/v1/constraints/' + constraint._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body._id.should.eql(constraint._id.toString());
    });

    it('it should not GET a fake constraint', async () => {
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const res = await chai.request(server).get('/v1/constraints/fake-contraint').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
    });
});

// Test the /POST route
describe('/POST constraint', () => {

    it('it should not POST a constraint without type1 field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type2: "Feature", element1: tag._id, element2: feature._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply type1');
    });

    it('it should not POST a constraint without type2 field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", element1: tag._id, element2: feature._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply type2');
    });

    it('it should not POST a constraint without element1 field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element2: feature._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply element1');
    });

    it('it should not POST a constraint without element2 field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply element2');
    });

    it('it should not POST a constraint without relationship field', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature._id }
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Please, supply a relationship');
    });

    it('it should not POST a constraint with a fake type1', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "FakeType", type2: "Feature", element1: tag._id, element2: feature._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Unrecognized resource type');
    });

    it('it should not POST a constraint with a fake type2', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "FakeType", element1: tag._id, element2: feature._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Unrecognized resource type');
    });

    it('it should not POST a constraint with a fake relatioship', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature._id, relationship: "fake-relationship" };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Unrecognized relationship');
    });

    it('it should not POST a constraint with a fake element1', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: "fake-element-1", element2: feature._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Element 1 not found');
    });

    it('it should not POST a constraint with a fake element2', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: "fake-element-2", relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Element 2 not found');
    });

    it('it should not POST a constraint with a fake tag', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: "fake-element-2", relationship: RelationshipTypes.dependency, tags: 'fake-tag' };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint)
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('Tag not existent');
    });

    it('it should POST a constraint', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature._id, relationship: RelationshipTypes.dependency };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('type1');
        res.body.type1.should.be.eql('Tag');
    });

    it('it should POST a tagged constraint', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature1 = await factory.createFeature("test-feature1", user);
        const feature2 = await factory.createFeature("test-feature2", user);
        const constraint = { owner: user, type1: "Feature", type2: "Feature", element1: feature1._id, element2: feature2._id, relationship: RelationshipTypes.dependency, tags: tag._id };
        const res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');
        res.body.should.have.property('type1');
        res.body.should.have.property('tags');
    });

    it('it should not POST a constraint with already exist', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature._id, relationship: RelationshipTypes.dependency };
        let res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint);
        res = await chai.request(server).post('/v1/constraints').set("Authorization", await factory.getUserToken(user)).send(constraint);
        res.should.have.status(errors.post_request_error.status);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.message.should.contain(errors.post_request_error.message);
        res.body.details.should.contain('The constraint already exists');
    });

    it('it should POST a list of constraint', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const constraints = [
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: (await factory.createFeature("test-feature-1", user))._id, relationship: RelationshipTypes.dependency },   
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: (await factory.createFeature("test-feature-2", user))._id, relationship: RelationshipTypes.dependency },  
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: (await factory.createFeature("test-feature-3", user))._id, relationship: RelationshipTypes.dependency }   
                        ];
        const res = await chai.request(server).post('/v1/constraints?verbose=true').set("Authorization", await factory.getUserToken(user)).send(constraints);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.constraints[0].element2.should.be.eql(constraints[0].element2);
        res.body.constraints[1].element2.should.be.eql(constraints[1].element2);
    });

    it('it should POST only not existing constraint from a list', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user);
        const feature1 = await factory.createFeature("test-feature-1", user);
        const feature2 = await factory.createFeature("test-feature-2", user);
        const feature3 = await factory.createFeature("test-feature-3", user);
        const constraints = [
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature1._id, relationship: RelationshipTypes.dependency },   
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature2._id, relationship: RelationshipTypes.dependency },  
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature3._id, relationship: RelationshipTypes.dependency },
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature3._id, relationship: RelationshipTypes.dependency },
                            { owner: user, type1: "Tag", type2: "Feature", element1: tag._id, element2: feature1._id, relationship: RelationshipTypes.dependency }   
                        ];
        const res = await chai.request(server).post('/v1/constraints?verbose=true').set("Authorization", await factory.getUserToken(user)).send(constraints);
        res.should.have.status(202);
        res.body.should.be.a('object');
        res.body.constraints.length.should.be.eql(3);
        res.body.errors.length.should.be.eql(2);
    });

});

// Test the /DELETE route
describe('/DELETE constraint', () => {
    it('it should DELETE a constraint', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint1 = await factory.createConstraint(user, "Tag", "Feature", tag._id, feature._id, RelationshipTypes.dependency);
        const constraint2 = await factory.createConstraint(user, "Feature", "Tag", feature._id, tag._id, RelationshipTypes.dependency);
        const constraints_before = await Constraint.find();
        constraints_before.length.should.be.eql(2);
        const res = await chai.request(server).delete('/v1/constraints/' + constraint1._id).set("Authorization", await factory.getUserToken(user));
        res.should.have.status(200);
        res.body.should.be.a('object');
        const constraints_after = await Constraint.find();
        constraints_after.length.should.be.eql(1);
    });

    it('it should not DELETE a fake constraint', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = await factory.createConstraint(user, "Tag", "Feature", tag._id, feature._id, RelationshipTypes.dependency);
        const constraints_before = await Constraint.find();
        constraints_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/constraints/fake_constraint').set("Authorization", await factory.getUserToken(user));
        res.should.have.status(errors.resource_not_found.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.resource_not_found.message);
        const constraints_after = await Constraint.find();
        constraints_after.length.should.be.eql(1);
    });
    
    it('it should not DELETE a constraint by non-owner', async () => {
        await mongoose.connection.dropDatabase();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const user2= await factory.createUser("test-username-2", "test-password-2", UserRoles.provider);
        const tag = await factory.createTag("test-tag", user); 
        const feature = await factory.createFeature("test-feature", user);
        const constraint = await factory.createConstraint(user, "Tag", "Feature", tag._id, feature._id, RelationshipTypes.dependency);
        const constraints_before = await Constraint.find();
        constraints_before.length.should.be.eql(1);
        const res = await chai.request(server).delete('/v1/constraints/' + constraint._id).set("Authorization", await factory.getUserToken(user2));
        res.should.have.status(errors.not_yours.status);
        res.body.should.be.a('object');
        res.body.message.should.contain(errors.not_yours.message);
        const constraints_after = await Constraint.find();
        constraints_after.length.should.be.eql(1);
    });
});
