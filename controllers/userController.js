const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const messages = require('../commons/messages.js');
const PasswordResetStatusTypes = require('../types/passwordResetStatusTypes.js');
const UserStatusTypes = require('../types/userStatusTypes.js');
const email = require('../commons/email.js');
const ObjectId = require('mongoose').Types.ObjectId;
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const bcrypt = require('bcryptjs');
const { passwordStrength } = require('check-password-strength');

exports.get = async (req, res) => { 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const select = await checker.whatCanSee(req, res, User);
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, User); 
};

exports.pipe = async (req, res) => { 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const select = await checker.whatCanSee(req, res, User);
    const result = await checker.isAdminitrator(req, res); if (result != true) return result;
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, User);
};

exports.getusernames = async (req, res) => { 
    const User = mongoose.dbs[req.tenant.database].model('User');
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', '{ "type": "0", "_id": "0" }', User); 
};

exports.getone = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    const select = await checker.whatCanSee(req, res, User);
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.getResource(req, res, null, User, select);
};

exports.post = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    let result = await checker.isAdminitrator(req, res); if (result != true) return result;
    return await controller.postResource(req, res, User);
};

exports.put = async (req, res) => { 
    const User = mongoose.dbs[req.tenant.database].model('User');
    const fields = ['password', 'fieldmask', 'email'];
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isValid(req, res, UserStatusTypes, 'status'); if (result != true) return result;
    result = await checker.isHim(req, res); if (result != true) return result; 
    return await controller.updateResource(req, res, fields, User);
};  

exports.delete = async (req, res) => {
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const User = mongoose.dbs[req.tenant.database].model('User');
    const Group = mongoose.dbs[req.tenant.database].model('Group');
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isAdminitrator(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Feature, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Thing, 'owner'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Tag, 'owner'); if (result != true) return result;   
    result = await checker.isNotUsed(req, res, Group, 'owner'); if (result != true) return result; 
    result = await checker.isNotUsed(req, res, Group, 'users'); if (result != true) return result;
    return await controller.deleteResource(req, res, User);
};

exports.self = async (req, res) => {
    if(!req.body.tenant) return errors.manage(res, errors.post_request_error, "Path `tenant` is required");
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const tenant = await Tenant.findById(req.body.tenant);
    if(!tenant) return errors.manage(res, errors.post_request_error, "Unknown tenant (" + req.body.tenant +")");
    const User = mongoose.dbs[tenant.database].model('User');
    req.body.status = UserStatusTypes.disabled;
    if(!req.body.email) return errors.manage(res, errors.missing_email);
    if(req.body.password) {
        if(!isPasswordStrongEnough(req.body.password))return errors.manage(res, errors.post_request_error, "The password strength is too weak, please choose a stronger password");
        if(req.tenant.passwordhash == true || req.tenant.passwordhash == 'true') req.body.password = bcrypt.hashSync(req.body.password, 8);}
    let user=null;
    try { user = await (new User(req.body)).save()}
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
    user = await User.findById(user._id);
    const url = req.protocol + '://' + req.get('host')
    await email.send(messages.welcome(url, user));
    res.status(200).json(user);
};

exports.awaiting = async (req, res) => {
    if(!req.query.tenant) return errors.manage(res, errors.get_request_error, "Query param `tenant` is required");
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const tenant = await Tenant.findById(req.query.tenant);
    if(!tenant) return errors.manage(res, errors.get_request_error, "Unknown tenant (" + req.query.tenant +")");
    const User = mongoose.dbs[tenant.database].model('User');
    let result = await checker.isAvailable(req, res, User); if (result != true) return result;
    await User.findByIdAndUpdate(req.params.id, { "$set": { "status": UserStatusTypes.awaiting } });
    let user_updated = await User.findById(req.params.id);
    const url = req.protocol + '://' + req.get('host')
    await email.send(messages.await(url, user_updated));
    return await res.status(200).json(user_updated); 
};

exports.accept = async (req, res) => {
    const User = mongoose.dbs[req.tenant.database].model('User');
    const fields = ['status'];
    let result = await checker.isAdminitrator(req, res); if (result != true) return result; 
    result = await checker.isAvailable(req, res, User); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.isValid(req, res, UserStatusTypes, 'status'); if (result != true) return result;
    await User.findByIdAndUpdate(req.params.id, { "$set": { "status": req.body.status } });
    let user_updated = await User.findById(req.params.id);
    const url = req.protocol + '://' + req.get('host')
    if(req.body.status == UserStatusTypes.enabled) await email.send(messages.accepted(url, user_updated));
    if(req.body.status == UserStatusTypes.disabled) await email.send(messages.disabled(url, user_updated));
    return await res.status(200).json(user_updated);
};

exports.reset = async (req, res) => {
    if(!req.query.tenant) return errors.manage(res, errors.get_request_error, "Query param `tenant` is required");
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const tenant = await Tenant.findById(req.query.tenant);
    if(!tenant) return errors.manage(res, errors.post_request_error, "Unknown tenant (" + req.query.tenant +")");
    const User = mongoose.dbs[tenant.database].model('User');
    const PasswordReset = mongoose.dbs[tenant.database].model('PasswordReset');
    if(!req.body.email) return errors.manage(res, errors.missing_email);
    const user = await User.findOne({email: req.body.email});
    if(!user) return errors.manage(res, errors.resource_not_found);
    const request = { user: user._id, status: PasswordResetStatusTypes.valid , created: Date.now() };
    const reset = await (new PasswordReset(request)).save();
    const url = req.protocol + '://' + req.get('host')
    await email.send(messages.reset(url, user, reset._id));
    return res.status(200).json({message: 'request sent'}); 
};

exports.password = async (req, res) => {
    if(!req.query.tenant) return errors.manage(res, errors.get_request_error, "Query param `tenant` is required");
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    const tenant = await Tenant.findById(req.query.tenant);
    if(!tenant) return errors.manage(res, errors.get_request_error, "Unknown tenant (" + req.query.tenant +")");
    const User = mongoose.dbs[tenant.database].model('User');
    const PasswordReset = mongoose.dbs[tenant.database].model('PasswordReset');
    if(!req.query.password) return errors.manage(res, errors.missing_info);
    if(!req.query.reset) return errors.manage(res, errors.missing_info);
    if(!ObjectId.isValid(req.query.reset)) return errors.manage(res, errors.resource_not_found, req.body.reset);
    const reset = await PasswordReset.findById(req.query.reset);
    if(!reset) return errors.manage(res, errors.resource_not_found, req.query.reset);
    if(reset.status == PasswordResetStatusTypes.invalid) return errors.manage(res, errors.reset_invalid, req.query.reset);
    const user = await User.findById(reset.user);
    if(!user) return errors.manage(res, errors.resource_not_found, 'user');
    const reset_updated = await PasswordReset.findByIdAndUpdate(req.query.reset, { "$set": { "status": PasswordResetStatusTypes.invalid } });   
    if(!isPasswordStrongEnough(req.query.password))return errors.manage(res, errors.get_request_error, "The password strength is too weak, make a new request to reset password and choose a stronger password");        
    if(req.tenant.passwordhash == true || req.tenant.passwordhash == 'true') req.query.password = bcrypt.hashSync(req.query.password, 8);
    const user_updated = await User.findByIdAndUpdate(user._id, { "$set": { "password": req.query.password, "createdPassword":Date.now() },  });
    return res.status(200).json(user_updated);   
};

const isPasswordStrongEnough = function (password) {
    const details = passwordStrength(password);
    return details.id >= process.env.MIN_PASSWORD_STRENGTH;
}
