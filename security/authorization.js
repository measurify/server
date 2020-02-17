
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

exports.hasMeasurementRights = function(user, rights, element) {
    let admitted = {};
    rights.forEach(right => { 
        right.type = right.type.toLowerCase();
        if(right.type == 'tag') right.type = right.type + 's';
        if(!admitted[right.type]) admitted[right.type] = [];        
            admitted[right.type].push(right.resource) 
    });
    for(let key in admitted) {
        if (Array.isArray(element[key])) { if(!element[key].some(item => admitted[key].includes(item))) return false; }
        else if(!admitted[key].includes(element[key])) return false;
    }
    return true;
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