
const UserRoles = require('../types/userRoles.js');
const AccessTypes = require('../types/accessTypes.js'); 
const VisibilityTypes = require('../types/visibilityTypes.js'); 

exports.isAdministrator = function(user) {
    if (user.type == UserRoles.admin) return true;
    else return false;
}

exports.isProvider = function(user) {
    if (user.type == UserRoles.provider) return true;
    else return false;
}

exports.isAnalyst = function(user) {
    if (user.type == UserRoles.analyst) return true;
    else return false;
}

exports.isOwner = function(user, element) {
    if(this.isAdministrator(user)) return true;
    return element.owner._id.equals(user._id); 
}

exports.hasRights = function(user, element, rights, access) {
    if(element.visibility == VisibilityTypes.public && access == AccessTypes.read) return true;
    if(user.type == UserRoles.analyst && access != AccessTypes.read) return false;
    if(rights) if(rights.access.includes(access)) return true;
    return false;
}