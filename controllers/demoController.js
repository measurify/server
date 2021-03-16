const mongoose = require('mongoose');
const factory = require('../commons/factory.js');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access); 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');
    const users = await User.find({}).select("+password");
    const tags = await Tag.find({});
    const features = await Feature.find({});
    const devices = await Device.find({});
    const things = await Thing.find({});
    const measurements = await Measurement.find({});
    const constraints = await Constraint.find({});
    const scripts = await Script.find({});
    const rights = await Right.find({});
    res.status(200).json({users: users, tags: tags, features:features, devices:devices, things:things, measurements:measurements, constraints:constraints, scripts:scripts, rights:rights });
};

exports.post = async (req, res) => {
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access); 

    const User = mongoose.dbs[req.tenant.database].model('User');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Right = mongoose.dbs[req.tenant.database].model('Right');  
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');

    let features = await Feature.find({});
    if(features.length == 0) await factory.createDemoContent(req.tenant); 

    const users = await User.find({});
    const tags = await Tag.find({});
    features = await Feature.find({});
    const devices = await Device.find({});
    const things = await Thing.find({});
    const measurements = await Measurement.find({});
    const constraints = await Constraint.find({});
    const scripts = await Script.find({});
    const rights = await Right.find({});
    res.status(200).json({users: users, tags: tags, features:features, devices:devices, things:things, measurements:measurements, constraints:constraints, script:scripts, rights:rights });
};

exports.delete = async (req, res) => {
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access); 
    await factory.dropContents(req.tenan);
    const User = mongoose.dbs[req.tenant.database].model('User');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Script = mongoose.dbs[req.tenant.database].model('Script');
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Right = mongoose.dbs[req.tenant.database].model('Right');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Constraint = mongoose.dbs[req.tenant.database].model('Constraint');
    const users = await User.find({}).select("+password");
    const tags = await Tag.find({});
    const features = await Feature.find({});
    const devices = await Device.find({});
    const things = await Thing.find({});
    const measurements = await Measurement.find({});
    const constraints = await Constraint.find({});
    const scripts = await Script.find({});
    const rights = await Right.find({});
    res.status(200).json({users: users, tags: tags, features:features, devices:devices, things:things, measurements:measurements, constraints:constraints, script:scripts, rights:rights });
};
