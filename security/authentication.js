const mongoose = require('mongoose');
const passport = require('passport');
const strategy_local = require('passport-local').Strategy;
const custom_strategy = require('passport-custom').Strategy;
const passportJWT = require("passport-jwt");
const strategy_jwt   = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserStatusTypes = require('../types/userStatusTypes.js');

passport.use(new strategy_local({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, 
    async function (req, username, password, done) {
        try {
            if(!req.body.tenant) req.body.tenant = process.env.DEFAULT_TENANT;
            const Tenant = mongoose.dbs['catalog'].model('Tenant');
            const tenant = await Tenant.findById(req.body.tenant);
            if (!tenant) return done(null, false, 'Incorrect tenant');
            req.tenant = tenant;
            const User = mongoose.dbs[tenant.database].model('User');
            const user = await User.findOne({username: username}).select('+password');
            if (!user) return done(null, false, 'Incorrect username or password');
            if(user.status && user.status != UserStatusTypes.enabled) return done(null, false, 'user not enabled');
            let result = false;
            if(req.tenant.passwordhash != false && req.tenant.passwordhash != "false") result = bcrypt.compareSync(password, user._doc.password);
            else if(password == user._doc.password) result = true; 
            if (result == false) return done(null, false, 'Incorrect username or password');
            return done(null, user, 'Logged Successfully');
        }
        catch(error) { 
            console.log(error);
            done(error) 
        };
    }
));

passport.use('api-token', new custom_strategy(
    function(req, done) {
        const token = req.body.Authorization || req.get('Authorization') || req.query.Authorization;
        if (!token) return done(null, false, "Missing token"); 
        else if (token != process.env.API_TOKEN) return done(null, false, 'Invalid token');
        else done(null, true, 'Logged Successfully');  
    }
));

passport.use('jwt-renew', new custom_strategy(
    async function(req, done) {
        let token = req.body.Authorization || req.get('Authorization') || req.query.Authorization;
        if (!token) return done(null, false, "Missing token"); 
        try { 
            token = token.replace('JWT ', '');
            const info = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true, maxAge: process.env.JWT_RENEW_EXPIRATIONTIME });
            const User = mongoose.dbs[info.tenant.database].model('User');
            const user = await User.findById(info.user._id);
            if (!user) return done(null, false, "Missing user");
            req.tenant = info.tenant;
            return done(null, user, 'Logged Successfully');  
        }
        catch(error) {
            return done(null, false, 'Login error (' + error + ')'); 
        }
    }
));

passport.use('jwt-token', new custom_strategy(
    async function(req, done) {
        let token = req.body.Authorization || req.get('Authorization') || req.query.Authorization;
        if (!token) return done(null, false, "Missing token"); 
        try { 
            if (token.startsWith('DVC '))
            {
                token = token.replace('DVC ', '');
                const info = jwt.verify(token, process.env.JWT_SECRET);
                const Device = mongoose.dbs[info.tenant.database].model('Device');
                const device = await Device.findById(info.device._id);     
                if (!device) return done(null, false, "Missing device");
                const User = mongoose.dbs[info.tenant.database].model('User');
                const user = await User.findById(device.owner);
                if (!user) return done(null, false, "Missing user of the device");
                req.tenant = info.tenant;
                req.device = info.device;
                return done(null, user, 'Logged Successfully');
            }
            token = token.replace('JWT ', '');
            const info = jwt.verify(token, process.env.JWT_SECRET);
            const User = mongoose.dbs[info.tenant.database].model('User');
            const user = await User.findById(info.user._id);     
            if (!user) return done(null, false, "Missing user");
            req.tenant = info.tenant;
            return done(null, user, 'Logged Successfully');  
        }
        catch(error) {
            return done(null, false, 'Login error (' + error + ')'); 
        }
    }
));

exports.encode = function(user, tenant) {
    let info = {};
    info.user = user;
    info.tenant = tenant;
    return 'JWT ' + jwt.sign(info, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATIONTIME});
};

exports.decode = function(token) {
    token = token.replace('JWT ', '');
    try {  return jwt.verify(token, process.env.JWT_SECRET); }
    catch(error) { return 'invalid token'; }  
}
exports.encodeDevice = function(device, tenant) {
    let info = {};
    info.device = device;
    info.tenant = tenant;
    return 'DVC ' + jwt.sign(info, process.env.JWT_SECRET, {expiresIn: '1000y'});
};

exports.decodeDevice = function(token) {
    token = token.replace('DVC ', '');
    try {  return jwt.verify(token, process.env.JWT_SECRET); }
    catch(error) { return 'invalid token'; }  
}

exports.info = async function(token) {
    const info =  {};
    token = token.replace('JWT ', '');
    let decoded = null;
    try { decoded = jwt.verify(token,process.env.JWT_SECRET); } 
    catch (err) { return false; }
    const User = mongoose.dbs[decoded.tenant.database].model('User');
    info.user = await User.findById(decoded.user._id);
    info.tenant = decoded.tenant;
    return info;
}    
