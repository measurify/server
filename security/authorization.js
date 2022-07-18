
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

exports.isSupplier = function(user) {
    if (user.type == UserRoles.supplier) return true;
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

exports.isHim = function(resource, user) {
    if(this.isAdministrator(user)) return true;
    return resource._id.equals(user._id); 
}

exports.isAvailable = async function(id, field, model) {
    let item = await persistence.get(id, field, model);
    if(!item && model.modelName == 'User') item = await persistence.get(id, 'username', model); 
    if(!item) return null; 
    return item;
}

exports.isNotUsed = async function(resource, model, field) {
    let references = [];
    if(model.schema.path(field).instance === 'Array') references = await model.find({ [field] : { $elemMatch : {$in: [resource._id]}  } }).limit(1);
    else references = await model.find({ [field]: resource._id }).limit(1);
    if (references.length != 0) return 'Used in ' + references.length + ' ' + model.modelName+', e.g. one _id is '+references[0]._doc._id;
    return true;
} 

exports.canCreate = function(user) {
    if (this.isAdministrator(user)) return true;
    if (this.isProvider(user)) return true;
    if (this.isSupplier(user)) return true;
    return false;
}

exports.canRead = function(resource, user) {
    if (this.isSupplier(user)) return false;
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
    if (this.isSupplier(user)) return true;
    if (this.isProvider(user) && this.isOwner(resource, user)) return true;
    return false;
} 

exports.canDeleteList = function(user) {
    if (this.isAdministrator(user)) return true;
    if (this.isSupplier(user)) return true;
    if (this.isProvider(user)) return true;
    if (this.isAnalyst(user)) return false;
    return false;
} 

exports.whatCanRead = function(user) {
    let result = {};
    if (this.isSupplier(user)) result = { visibility: VisibilityTypes.public };
    if (this.isAdministrator(user)) return result;
    if (this.isAnalyst(user)) return result;
    if (this.isProvider(user)) result = { $or: [  { owner: user._id }, { visibility: VisibilityTypes.public } ] };
    return result;
} 

exports.whichRights = function(user, rights, where) {
    let result = {};
    if (this.isAdministrator(user)) return result;
    rights.forEach(right => { 
        if(where == 'type') {
            if(!result[right.type]) result[right.type] = { $in: [] };
            result[right.type].$in.push(right.resource)
        }
        else {
            if(!result['_id']) result['_id'] = { $in: [] };
            result['_id'].$in.push(right.resource) 
        } 
    });
    return result;
}

exports.hasRightsToCreate = function(user, rights, element, fields) {
    if (this.isAdministrator(user)) return true;
    if(!rights || rights.length == 0) return true;
    let admitted = {};
    rights.forEach(right => { 
        right.type = right.type.toLowerCase();
        if(right.type == 'tag') right.type = right.type + 's';
        if(!admitted[right.type]) admitted[right.type] = [];        
        admitted[right.type].push(right.resource) 
    });
    for(let field of fields) {
        if(admitted[field] != null && admitted[field].length !=0 && element[field] != null) {
            if(Array.isArray(element[field])) {if(!admitted[field].some(r => element[field].includes(r))) return false; }
            else { if(!admitted[field].includes(element[field])) return false; }
        }
    };
    return true;
} 

exports.hasRights = function(user, rights, element, where) {
    if (this.isAdministrator(user)) return true;
    if(where == 'type') {
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
    else {
        if(!rights || rights.length == 0) return true;
        if(rights.map(right => right.resource).includes(element._id)) return true;
        return false;
    }
}

exports.readJustOwned = function(user) {
    if (this.isAdministrator(user)) return null;
    return { owner: user._id };
} 

exports.whatCanDelete = function(user) {
    if (this.isAdministrator(user)) return null;
    if (this.isSupplier(user)) return null;
    if (this.isProvider(user)) return { owner: user._id };
    return null;
} 