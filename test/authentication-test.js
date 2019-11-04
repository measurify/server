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
const UserRoles = require('../models/UserRoles.js');

chai.use(chaiHttp);

describe('encode and decode', () => {
    it('it should decode a previus encoded string', async () => {
        await factory.dropContents();
        const user = await factory.createUser("test-username-1", "test-password-1", UserRoles.admin);
        const encoded = Authentication.encode(user);
        encoded.should.contain('JWT');
        const decoded = Authentication.decode(encoded)
        decoded.username.should.equal(user.username);
    });

    it('it should not decode a fake encoded string', async () => {
        await factory.dropContents();
        const decoded = Authentication.decode("fake")
        decoded.should.contain("invalid token");
    });
});
