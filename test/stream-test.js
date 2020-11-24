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
const assert = require('chai').assert;
chai.use(chaiHttp);
const before = require('./before-test.js');


// Test the stream for a thing
describe('Thing stream', () => {
    it('it should GET measurements of a thing', async () => {
        const WebSocket = require('ws');
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?thing=" + thing._id + "&token=" + analyst_token;
        const client = new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains(thing._id);
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    });

    it('it should GET measurements of a device', async () => {
        const WebSocket = require('ws');
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?device=" + device._id + "&token=" + analyst_token;
        const client = new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains(device._id);
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    });

    it('it should not GET measurements of a fake thing', async () => {
        const WebSocket = require('ws');
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?thing=fake-thing&token=" + analyst_token;
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains('fake-thing');
            message.should.contains('Resource Not found');
            message.should.contains('404');
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    });

    it('it should not GET measurements of a fake device', async () => {
        const WebSocket = require('ws');
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?device=fake-device&token=" + analyst_token;
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains('fake-device');
            message.should.contains('Resource Not found');
            message.should.contains('404');
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    });

    it('it should not GET measurements of a thing with a fake token', async () => {
        const WebSocket = require('ws');
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?thing=" + thing._id + "&token=fake-token";
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains('Websocket disconnected due to invalid token');
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    }); 

    it('it should not GET measurements of a device with a fake token', async () => {
        const WebSocket = require('ws');
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?device=" + device._id + "&token=fake-token";
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains('Websocket disconnected due to invalid token');
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    });

    it('it should not GET measurements of a fake entity', async () => {
        const WebSocket = require('ws');
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?fake=" + thing._id + "&token=" + analyst_token;
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains('Websocket disconnected due to invalid entity');
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    }); 

    it('it should not GET measurements of a thing wothout rights', async () => {
        const WebSocket = require('ws');
        const admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const thing_owned = await factory.createThing("test-thing-2", provider);
        const right = await factory.createRight(thing_owned, "Thing", analyst, admin, []);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?thing=" + thing._id + "&token=" + analyst_token;
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains('You cannot access this resource');
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    }); 

    it('it should GET measurements of a thing with rights', async () => {
        const WebSocket = require('ws');
        const admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing = await factory.createThing("test-thing-1", provider);
        const right = await factory.createRight(thing, "Thing", analyst, admin, []);
        const measurement_request = { owner: provider, feature: feature._id, device: device._id, thing: thing._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url = "wss://localhost:443/v1/streams?thing=" + thing._id + "&token=" + analyst_token;
        const client = await new WebSocket(url);
        client.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains(thing._id);
            client.close();
        });
        client.on('error', function (message) { assert.fail(message) });
        client.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request); });
        await new Promise(done => { client.on('close', done) });
    }); 

    it('it should GET measurements of two different things on two different socket', async () => {
        const WebSocket = require('ws');
        const admin = await factory.createUser("test-username-admin", "test-password-admin", UserRoles.admin);
        const provider = await factory.createUser("test-username-1", "test-password-1", UserRoles.provider);
        const analyst = await factory.createUser("test-username-2", "test-password-2", UserRoles.analyst);
        const feature = await factory.createFeature("test-feature", provider);
        const device = await factory.createDevice("test-device-1", provider, [feature]);
        const thing_1 = await factory.createThing("test-thing-1", provider);
        const thing_2 = await factory.createThing("test-thing-2", provider);
        const measurement_request_1 = { owner: provider, feature: feature._id, device: device._id, thing: thing_1._id, samples: factory.createSamples(1) };
        const measurement_request_2 = { owner: provider, feature: feature._id, device: device._id, thing: thing_2._id, samples: factory.createSamples(1) };
        const provider_token = await factory.getUserToken(provider);
        const analyst_token = await factory.getUserToken(analyst);
        const url_1 = "wss://localhost:443/v1/streams?thing=" + thing_1._id + "&token=" + analyst_token;
        const url_2 = "wss://localhost:443/v1/streams?thing=" + thing_2._id + "&token=" + analyst_token;
        const client_1 = await new WebSocket(url_1);
        client_1.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains(thing_1._id);
            client_1.close();
        });
        client_1.on('error', function (message) { assert.fail(message) });
        const client_2 = await new WebSocket(url_2);
        client_2.on('message', function (message) {
            message.should.be.a('string');
            message.should.contains(thing_2._id);
            client_2.close();
        });
        client_2.on('error', function (message) { assert.fail(message) });
        client_1.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request_1); });
        client_2.on('open', async function (message) { await chai.request(server).keepOpen().post('/v1/measurements').set("Authorization", provider_token).send(measurement_request_2); });
        const promise_1 = new Promise(done_1 => { client_1.on('close', done_1) });
        const promise_2 = new Promise(done_2 => { client_2.on('close', done_2) });
        await Promise.all([promise_1, promise_2])
    }); 
});
