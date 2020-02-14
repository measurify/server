
const UserRoles = require('../types/userRoles.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const persistence = require('../commons/persistence.js');

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

exports.isOwner = function(resource, user) {
    if(this.isAdministrator(user)) return true;
    return resource.owner._id.equals(user._id); 
}

exports.hasRights = function(rights, access) {
    if(rights) if(!rights.access.includes(access)) return false;
    return false;
}

exports.isAvailable = async function(id, field, model) {
    const item = await persistence.get(id, field, model);
    if(!item) return null; 
    return item;
}

exports.isFilled = function(body, values ) {
    if(!values.some(function (element) { return body[element] !== null; }) ) return false;
    return true;
}

exports.isNotUsed = async function(resource, model, field) {
    let references = [];
    if(model.schema.path(field).instance === 'Array') references = await model.find({ [field] : { $elemMatch : {$in: [resource._id]}  } }).limit(1);
    else references = await model.find({ [field]: resource._id }).limit(1);
    if (references.length != 0) return 'Used in ' + references._id + ' ' + model.modelName;
    return true;
} 

exports.canCreate = function(user) {
    if (this.isAdministrator(user)) return true;
    if (this.isProvider(user)) return true;
    return false;
}

exports.canRead = function(resource, user) {
    if (!resource.visibility) resource.visibility = VisibilityTypes.private;
    if (resource.visibility == VisibilityTypes.public) return true;
    if (this.isAdministrator(user)) return true;
    if (this.isAnalyst(user)) return true;
    if (this.isProvider(user) && this.isOwner(resource, user)) return true;
    return false;
} 

exports.canModify = function(resource, user) {
    if (this.isAdministrator(user)) return true;
    if (this.isProvider(user) && this.isOwner(resource, user)) return true;
    return false
} 

exports.canDelete = function(resource, user) {
    if (this.isAdministrator(user)) return true;
    if (this.isProvider(user) && this.isOwner(resource, user)) return true;
    return false;
} 

exports.whatCanRead = function(user) {
    let result = {};
    if (this.isAdministrator(user)) return result;
    if (this.isAnalyst(user)) return result;
    if (this.isProvider(user)) result = { $or: [  { owner: user._id }, { visibility: VisibilityTypes.public } ] };
    return result;
} 

exports.addRights = function(user, rights) {
    let result = {};
    if (this.isAdministrator(user)) return result;
    rights.forEach(right => { 
        if(!result[right.type]) result[right.type] = { $in: [] };
        result[right.type].$in.push(right.resource) 
    });
    return result;
}

exports.hasRights = function(user, rights, element) {
    return true;
//    let admitted = {};
//    rights.forEach(right => { 
//        if(!admitted[right.type]) admitted[right.type] = { $in: [] };
//        admitted[right.type].push(right.resource) 
//    });

//    admitted.forEach( => {
//        if(Array.isArray(element[right.type])) if(!element[right.type].includes(right.resource)) return false;
//        else if(element[right.type] != right.resource) return false
//
//    });
//    return true;
}

exports.readJustOwned = function(user) {
    if (this.isAdministrator(user)) return null;
    return { owner: user._id };
} 

exports.whatCanDelete = function(user) {
    if (this.isAdministrator(user)) return null;
    if (this.isProvider(user)) return { owner: user._id };
    return null;
} 