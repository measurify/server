// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.test.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const notifier = require('../commons/notifier.js');

chai.use(chaiHttp);

describe('notifications', () => {
    
    it('it should send a notification', async () => {
        const token = "[PROVIDE_A_VALID_TOKEN]";
        const title = "ciao";
        const body = "come stai 3?";
        const res = await notifier.send(token, title, body);
        res.successCount.should.be.eq(1);
    });

});
