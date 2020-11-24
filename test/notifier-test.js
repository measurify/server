process.env.ENV = 'test';
process.env.LOG = 'false'; 

// Import test tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const database = require('../database.js');
const server = require('../server.js');
const mongoose = require('mongoose');
const should = chai.should();
const notifier = require('../commons/notifier.js');
const factory = require('../commons/factory.js');
chai.use(chaiHttp);
const before = require('./before-test.js');

describe('notifications', () => {
    it('it should send a notification', async () => {
        const token = "[PROVIDE_A_VALID_TOKEN]";
        const title = "ciao";
        const body = "come stai 3?";
        const res = await notifier.send(token, title, body);
        res.successCount.should.be.eq(1);
    });

});
