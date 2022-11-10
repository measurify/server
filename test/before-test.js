// Import environmental variables from variables.test.env file
require('dotenv').config({ path: './init/variables.env' });

// This line allow to test with the self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const database = require('../database.js');
const mongoose = require('mongoose');
const factory = require('../commons/factory.js');
const cache = require('../commons/cache.js');

exports.Fieldmask = null;
exports.User = null;
exports.Role = null;
exports.Group = null;
exports.Tag = null;
exports.Log = null;
exports.Computation = null;
exports.Script = null;
exports.Feature = null;
exports.Thing = null;
exports.Dataupload = null;
exports.Device = null;
exports.Issue = null;
exports.Right = null;
exports.Subscription = null;
exports.Measurement = null;
exports.Computation = null;
exports.Constraint = null;
exports.PasswordReset = null;
exports.Tenant = null;
exports.Protocol = null;
exports.Experiment = null;

before(async () => { 
    // Init Database
    await database.init('test');
  
    // Init cache
    await cache.init();

    this.Fieldmask = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Fieldmask');
    this.User = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('User');
    this.Role = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Role');
    this.Group = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Group');
    this.Tag = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Tag');
    this.Computation = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Computation');
    this.Script = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Script');
    this.Feature = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Feature');
    this.Thing = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Thing');
    this.Dataupload = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Dataupload');
    this.Device = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Device');
    this.Issue = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Issue');
    this.Right = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Right');
    this.Subscription = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Subscription');
    this.Measurement = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Measurement');
    this.Computation = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Computation');
    this.Constraint = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Constraint');
    this.PasswordReset = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('PasswordReset');
    this.Protocol = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Protocol');
    this.Experiment = mongoose.dbs[process.env.DEFAULT_TENANT_DATABASE].model('Experiment');
    this.Tenant = mongoose.dbs['catalog'].model('Tenant');
});

beforeEach(async () => { 
    await cache.flush();
    await factory.dropContents(); 
});
