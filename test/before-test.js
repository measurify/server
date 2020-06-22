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

    Fieldmask = mongoose.dbs[process.env.DEFAULT_TENANT].model('Fieldmask');
    User = mongoose.dbs[process.env.DEFAULT_TENANT].model('User');
    Tag = mongoose.dbs[process.env.DEFAULT_TENANT].model('Tag');
    Computation = mongoose.dbs[process.env.DEFAULT_TENANT].model('Computation');
    Script = mongoose.dbs[process.env.DEFAULT_TENANT].model('Script');
    Feature = mongoose.dbs[process.env.DEFAULT_TENANT].model('Feature');
    Thing = mongoose.dbs[process.env.DEFAULT_TENANT].model('Thing');
    Device = mongoose.dbs[process.env.DEFAULT_TENANT].model('Device');
    Issue = mongoose.dbs[process.env.DEFAULT_TENANT].model('Issue');
    Right = mongoose.dbs[process.env.DEFAULT_TENANT].model('Right');
    Subscription = mongoose.dbs[process.env.DEFAULT_TENANT].model('Subscription');
    Measurement = mongoose.dbs[process.env.DEFAULT_TENANT].model('Measurement');
    Computation = mongoose.dbs[process.env.DEFAULT_TENANT].model('Computation');
    Constraint = mongoose.dbs[process.env.DEFAULT_TENANT].model('Constraint');
    PasswordReset = mongoose.dbs[process.env.DEFAULT_TENANT].model('PasswordReset');
    Tenant = mongoose.dbs['catalog'].model('Tenant');
});

beforeEach(async () => { await factory.dropContents(); });
