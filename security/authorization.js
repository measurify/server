const UserTypes = require('../models/userTypes.js');

exports.isAdministrator = function(user) {
    if (user.type == UserTypes.admin) return true;
    else return false;
}

exports.isProvider = function(user) {
    if (user.type == UserTypes.provider) return true;
    else return false;
}

exports.isAnalyst = function(user) {
    if (user.type == UserTypes.analyst) return true;
    else return false;
}

exports.isOwner = function(user, element) {
    if(this.isAdministrator(user)) return true;
    return element.owner._id.equals(user._id); 
}