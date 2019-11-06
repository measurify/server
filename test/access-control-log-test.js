// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const Authentication = require('../security/authentication.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const factory = require('../commons/factory.js');
const User = mongoose.model('User');
const UserRoles = require('../types/userRoles.js');

chai.use(chaiHttp);

describe('Accessing Logs', () => {
    it('it should get logs as admin', async () => {
        await mongoose.connection.dropDatabase();
        const admin = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        await chai.request(server).get('/v1/devices').set("Authorization", await factory.getUserToken(admin));
        await chai.request(server).get('/v1/devices').set("Authorization", await factory.getUserToken(admin));
        await chai.request(server).get('/v1/devices').set("Authorization", await factory.getUserToken(admin));
        await chai.request(server).get('/v1/devices').set("Authorization", await factory.getUserToken(admin));
        const res = await chai.request(server).get('/v1/log').set("Authorization", await factory.getUserToken(admin));
        console.log(res.text);
        res.should.have.status(200);
        res.body.docs.should.be.a('array');
        res.body.docs.length.should.be.eql(4);

    });

    it('it should not get logs as non admin', async () => {

    });
});
