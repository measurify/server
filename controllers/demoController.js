const mongoose = require('mongoose');
const factory = require('../commons/factory.js');
const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Device = mongoose.model('Device');
const Script = mongoose.model('Script');
const Thing = mongoose.model('Thing');
const Measurement = mongoose.model('Measurement');
const Constraint = mongoose.model('Constraint');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access); 
    const users = await User.find({}).select("+password");
    const tags = await Tag.find({});
    const features = await Feature.find({});
    const devices = await Device.find({});
    const things = await Thing.find({});
    const measurements = await Measurement.find({});
    const constraints = await Constraint.find({});
    const scripts = await Script.find({});
    res.status(200).json({users: users, tags: tags, features:features, devices:devices, things:things, measurements:measurements, constraints:constraints, script:scripts });
};

exports.post = async (req, res) => {
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access); 
    await factory.dropContents();
    if (req.body != '{}') await factory.createDemoContent(); 
    else return errors.manage(res, errors.demo_content_request_not_implemented);
    const users = await User.find({}).select("+password");
    const tags = await Tag.find({});
    const features = await Feature.find({});
    const devices = await Device.find({});
    const things = await Thing.find({});
    const measurements = await Measurement.find({});
    const constraints = await Constraint.find({});
    const scripts = await Script.find({});
    res.status(200).json({users: users, tags: tags, features:features, devices:devices, things:things, measurements:measurements, constraints:constraints, script:scripts });
};

exports.delete = async (req, res) => {
    if (!Authorization.isAdministrator(req.user)) return errors.manage(res, errors.admin_restricted_access); 
    await factory.dropContents();
    const users = await User.find({}).select("+password");
    const tags = await Tag.find({});
    const features = await Feature.find({});
    const devices = await Device.find({});
    const things = await Thing.find({});
    const measurements = await Measurement.find({});
    const constraints = await Constraint.find({});
    const scripts = await Script.find({});
    res.status(200).json({users: users, tags: tags, features:features, devices:devices, things:things, measurements:measurements, constraints:constraints, script:scripts });
};
