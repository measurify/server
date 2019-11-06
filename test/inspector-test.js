// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('chai').assert;
const database = require('../database.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const Measurement = mongoose.model('Measurement');
const User = mongoose.model('User');
const UserRoles = require('../types/userRoles.js');
const errors = require('../commons/errors.js');
const ItemTypes = require('../types/itemTypes.js');

chai.use(chaiHttp);

describe('areCoherent test', () => {
    it('it should throw an exception for measurements not coherent with feature (1 text 0-D item and a numeric sample value)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.text, dimension: 0 } ];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: 54, delta: 200 }];
        try { 
            await factory.createMeasurement(owner, feature, device, thing, [tag], samples); 
            assert.fail();
        }
        catch(err) { err.message.should.contain('No match between sample value type and feature items type') };
    });

    it('it should throw an exception for measurements not coherent with feature (1 numeric 0-D item and a string sample value)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.numeric, dimension: 0 } ];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: "54", delta: 200 }];
        try { 
            await factory.createMeasurement(owner, feature, device, thing, [tag], samples); 
            assert.fail();
        }
        catch(err) { err.message.should.contain('No match between sample value type and feature items type') };
    });

    it('it should throw an exception for measurements not coherent with feature (2 numeric 0-D item and a string sample value)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.numeric, dimension: 0 },
                      { name: "item-name-2", unit: "item-unit-2", type: ItemTypes.numeric, dimension: 0 } ];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: ["54", "54"], delta: 200 }];
        try { 
            await factory.createMeasurement(owner, feature, device, thing, [tag], samples); 
            assert.fail();
        }
        catch(err) { err.message.should.contain('No match between sample value type and feature items type') };
    });

    it('it should throw an exception for measurements not coherent with feature (2 numeric/string 0-D item and a string/numeric sample value)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.string, dimension: 0 },
                      { name: "item-name-2", unit: "item-unit-2", type: ItemTypes.numeric, dimension: 0 } ];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: [54, "54"], delta: 200 }];
        try { 
            await factory.createMeasurement(owner, feature, device, thing, [tag], samples); 
            assert.fail();
        }
        catch(err) { err.message.should.contain('No match between sample value type and feature items type') };
    });

    it('it should throw an exception for measurements not coherent with feature (1 numeric 1-D item and a numeric sample value)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.numeric, dimension: 1 } ];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: "54", delta: 200 }];
        try { 
            await factory.createMeasurement(owner, feature, device, thing, [tag], samples); 
            assert.fail();
        }
        catch(err) { err.message.should.contain('No match between sample value size and feature items dimension') };
    });

    it('it should create a measurements coherents with its feature (1 0-D numeric item)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.number, dimension: 0 } ];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: 54, delta: 200 }];
        let measurement = await factory.createMeasurement(owner, feature, device, thing, [tag], samples);
    });

    it('it should create a measurements coherents with its feature (2 1-D numeric item)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.number, dimension: 1 }, 
                      { name: "item-name-2", unit: "item-unit-2", type: ItemTypes.number, dimension: 1 }];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: [[54, 34], [32, 34]], delta: 200 }];
        let measurement = await factory.createMeasurement(owner, feature, device, thing, [tag], samples);
    });

    it('it should create a measurements coherents with its feature (2 1-D string/numeric item)', async () => {
        await mongoose.connection.dropDatabase();
        const owner = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const tag = await factory.createTag("test-tag-1", owner);
        const thing = await factory.createThing("test-thing-1", owner);
        let items = [ { name: "item-name-1", unit: "item-unit-1", type: ItemTypes.number, dimension: 1 }, 
                      { name: "item-name-2", unit: "item-unit-2", type: ItemTypes.text, dimension: 1 }];
        let feature = await factory.createFeature("test-feature-1", owner, items);
        let device = await factory.createDevice("test-device-1", owner, [feature]);
        let samples = [ { values: [[54, 34], ["text-value-1", "text-value-2"]], delta: 200 }];
        let measurement = await factory.createMeasurement(owner, feature, device, thing, [tag], samples);
    });
});
