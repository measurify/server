const mongoose = require('mongoose');
const passport = require('passport');
const strategy_local = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const strategy_jwt   = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const UserStatusTypes = require('../types/userStatusTypes.js');

passport.use(new strategy_local({
        usernameField: 'username',
        passwordField: 'password'
    }, 
    async function (username, password, done) {
        try {
            const user = await User.findOne({username: username}).select('+password');
            if (!user) return done(null, false, "Incorrect username or password");
            if(user.status && user.status != UserStatusTypes.enabled) return done(null, false, "user not enabled");
            let result = false;
            if(process.env.PASSWORDHASH == 'true') result = bcrypt.compareSync(password, user._doc.password);
            else if(password == user._doc.password) result = true; 

            if (!result) return done(null, false, "Incorrect username or password");
            return done(null, user, "Logged Successfully");
        }
        catch(error) { done(error) };
    }
));

passport.use(new strategy_jwt({
        jwtFromRequest: extractJWT.fromAuthHeaderWithScheme("jwt"),
        secretOrKey   : process.env.JWTSECRET
    },
    function (jwtPayload, done) {
        return User.findById(jwtPayload._id)
        .then(user => {
            //req.user = user; 
            return done(null, user);
        })
        .catch(error => done(error));
    }
));

exports.encode = function(obj) {
    return 'JWT ' + jwt.sign(obj.toJSON(), process.env.JWTSECRET, {expiresIn: process.env.EXPIRATIONTIME});
};

exports.decode = function(token) {
    token = token.replace('JWT ', '');
    try {  return jwt.verify(token, process.env.JWTSECRET); }
    catch(error) { return "invalid token"; }  
}
