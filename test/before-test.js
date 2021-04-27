// Import environmental variables from variables.test.env file
require('dotenv').config({ path: './init/variables.env' });

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
exports.tenant = null;

before(async () => { 
    await database.init('test');

    this.Fieldmask = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Fieldmask');
    this.User = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('User');
    this.Tag = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Tag');
    this.Computation = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Computation');
    this.Script = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Script');
    this.Feature = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Feature');
    this.Thing = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Thing');
    this.Device = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Device');
    this.Issue = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Issue');
    this.Right = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Right');
    this.Subscription = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Subscription');
    this.Measurement = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Measurement');
    this.Computation = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Computation');
    this.Constraint = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Constraint');
    this.PasswordReset = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('PasswordReset');
    this.Tenant = mongoose.dbs['catalog'].model('Tenant');
});

beforeEach(async () => { await factory.dropContents(); });
