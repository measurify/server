// Import environmental variables from variables.test.env file
require('dotenv').config({ path: 'variables.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const database = require('../database.js');
const mongoose = require('mongoose');
const factory = require('../commons/factory.js');

exports.Fieldmask = null;
exports.User = null;
exports.Tag = null;
exports.Log = null;
exports.Computation = null;
exports.Script = null;
exports.Feature = null;
exports.Thing = null;
exports.Device = null;
exports.Issue = null;
exports.Right = null;
exports.Subscription = null;
exports.Measurement = null;
exports.Computation = null;
exports.Constraint = null;
exports.PasswordReset = null;
exports.Tenant = null;

before(async () => { 

    process.env.DEFAULT_TENANT = process.env.DEFAULT_TENANT;
    await database.init('test');

    this.Fieldmask = mongoose.dbs[process.env.DEFAULT_TENANT].model('Fieldmask');
    this.User = mongoose.dbs[process.env.DEFAULT_TENANT].model('User');
    this.Tag = mongoose.dbs[process.env.DEFAULT_TENANT].model('Tag');
    this.Computation = mongoose.dbs[process.env.DEFAULT_TENANT].model('Computation');
    this.Script = mongoose.dbs[process.env.DEFAULT_TENANT].model('Script');
    this.Feature = mongoose.dbs[process.env.DEFAULT_TENANT].model('Feature');
    this.Thing = mongoose.dbs[process.env.DEFAULT_TENANT].model('Thing');
    this.Device = mongoose.dbs[process.env.DEFAULT_TENANT].model('Device');
    this.Issue = mongoose.dbs[process.env.DEFAULT_TENANT].model('Issue');
    this.Right = mongoose.dbs[process.env.DEFAULT_TENANT].model('Right');
    this.Subscription = mongoose.dbs[process.env.DEFAULT_TENANT].model('Subscription');
    this.Measurement = mongoose.dbs[process.env.DEFAULT_TENANT].model('Measurement');
    this.Computation = mongoose.dbs[process.env.DEFAULT_TENANT].model('Computation');
    this.Constraint = mongoose.dbs[process.env.DEFAULT_TENANT].model('Constraint');
    this.PasswordReset = mongoose.dbs[process.env.DEFAULT_TENANT].model('PasswordReset');
    this.Tenant = mongoose.dbs['catalog'].model('Tenant');
});

beforeEach(async () => { await factory.dropContents(); });
