const mongoose = require('mongoose');
const passport = require('passport');
const strategy_local = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const strategy_jwt   = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

passport.use(new strategy_local({
        usernameField: 'username',
        passwordField: 'password'
    }, 
    function (username, password, done) {
        return User.findOne({username: username, password: password})
        .then(user => {
           if (!user)
               return done(null, false, "Incorrect username or password");
           return done(null, user, "Logged Successfully");
      })
      .catch(error => done(error));
    }
));

passport.use(new strategy_jwt({
        jwtFromRequest: extractJWT.fromAuthHeaderWithScheme("jwt"),
        secretOrKey   : process.env.SECRET
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
    return 'JWT ' + jwt.sign(obj.toJSON(), process.env.SECRET, {expiresIn: process.env.EXPIRATIONTIME});
};

exports.decode = function(token) {
    token = token.replace('JWT ', '');
    try {  return jwt.verify(token, process.env.SECRET); }
    catch(error) { return "invalid token"; }  
}
