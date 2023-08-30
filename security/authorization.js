const mongoose = require('mongoose');
const UserRoles = require('../types/userRoles.js');
const VisibilityTypes = require('../types/visibilityTypes.js');
const CrudTypes = require('../types/crudTypes.js');
const RoleCrudTypes = require('../types/roleCrudTypes.js');
const persistence = require('../commons/persistence.js');
const { equalScalarDependencies } = require('mathjs');
const StageTypes = require("../types/stageTypes.js");

exports.isAdministrator = function (user) {
    if (user.type == UserRoles.admin) return true;
    else return false;
}

exports.isProvider = function (user) {
    if (user.type == UserRoles.provider) return true;
    else return false;
}

exports.isSupplier = function (user) {
    if (user.type == UserRoles.supplier) return true;
    else return false;
}

exports.isAnalyst = function (user) {
    if (user.type == UserRoles.analyst) return true;
    else return false;
}

exports.isOwner = function (resource, user) {
    if (this.isAdministrator(user)) return true;
    return resource.owner._id.equals(user._id);
}

exports.isHim = function (resource, user) {
    if (this.isAdministrator(user)) return true;
    return resource._id.equals(user._id);
}

exports.isAvailable = async function (id, field, model, req) {
    let item = await persistence.get(id, field, model);
    if (!item && model.modelName == 'User') { item = await persistence.get(id, 'username', model); if (item) req.params.id = item._id }
    if (!item) return null;
    return item;
}

exports.isNotUsed = async function (resource, model, field) {
    let references = [];
    if (model.schema.path(field).instance === 'Array') references = await model.find({ [field]: { $elemMatch: { $in: [resource._id] } } }).limit(1);
    else references = await model.find({ [field]: resource._id }).limit(1);
    if (references.length != 0) return 'Used in ' + references.length + ' ' + model.modelName + ', e.g. one _id is ' + references[0]._doc._id;
    return true;
}

exports.canOperate = function (user, role, method, entity, resource) {
    let roleEntity = role.actions.filter(action => action.entity.toLowerCase() == entity.toLowerCase())
    let permission = undefined;
    if (roleEntity.length) { if (roleEntity[0].crud[CrudTypes[method]] !== undefined) permission = roleEntity[0].crud[CrudTypes[method]] };
    if (permission === undefined) permission = role.default[CrudTypes[method]];
    if (method == "POST") return permission;
    if (permission == RoleCrudTypes.all) return true;
    if (permission == RoleCrudTypes.owned) return this.isOwner(resource, user);
    if (!resource.visibility) resource.visibility = VisibilityTypes.private;
    if (permission == RoleCrudTypes.public_and_owned) return this.isOwner(resource, user) || resource.visibility == VisibilityTypes.public;
    return false;
}

exports.whatCanOperate = function (user, role, method, entity) { //read,delete 
    let result = {};
    let roleEntity = role.actions.filter(action => action.entity.toLowerCase() == entity.toLowerCase())
    let permission = undefined;
    if (roleEntity.length) { if (roleEntity[0].crud[CrudTypes[method]] !== undefined) permission = roleEntity[0].crud[CrudTypes[method]] };
    if (permission === undefined) permission = role.default[CrudTypes[method]];
    if (permission == RoleCrudTypes.all) return result;
    if (permission == RoleCrudTypes.owned) return result = { $and: [{ owner: user._id }] };
    //ADDED 
    if (permission == RoleCrudTypes.public_and_owned&&method=="GET"&&entity.toLowerCase()=="measurement") return result = { $or: [{$and: [{ visibility: VisibilityTypes.public },{ $or:[{stage:StageTypes.final},{stage:undefined}]}]}, { owner: user._id }] };
    if (permission == RoleCrudTypes.public_and_owned) return result = { $or: [{ owner: user._id }, { visibility: VisibilityTypes.public }] };
    return result = { $and: [{ owner: user._id }, { visibility: VisibilityTypes.public }, { visibility: VisibilityTypes.private }] }//none    
}

exports.canDeleteMeasurementList = function (user, role, method, entity) {
    if (method != "DELETE") return false;//Delete
    let roleEntity = role.actions.filter(action => action.entity.toLowerCase() == entity.toLowerCase())
    let permission = undefined;
    if (roleEntity.length) { if (roleEntity[0].crud[CrudTypes[method]] !== undefined) permission = roleEntity[0].crud[CrudTypes[method]] };
    if (permission === undefined) permission = role.default[CrudTypes[method]];
    if (permission == RoleCrudTypes.all) return true;
    if (permission == RoleCrudTypes.owned) return true;

    if (permission == RoleCrudTypes.public_and_owned) return true;
    return false;
}

exports.whichRights = function (user, rights, where) {
    let result = {};
    if (this.isAdministrator(user)) return result;
    rights.forEach(right => {
        if (where == 'type') {
            right.type = right.type.toLowerCase()
            if (right.type == 'tag') right.type = 'tags';
            if (!result[right.type]) result[right.type] = { $in: [] };
            result[right.type].$in.push(right.resource)
        }
        else {
            if (!result['_id']) result['_id'] = { $in: [] };
            result['_id'].$in.push(right.resource)
        }
    });
    return result;
}

exports.hasRightsToCreate = function (user, rights, element, fields) {
    if (this.isAdministrator(user)) return true;
    if (!rights || rights.length == 0) return true;
    let admitted = {};
    rights.forEach(right => {
        right.type = right.type.toLowerCase();
        if (right.type == 'tag') right.type = right.type + 's';
        if (!admitted[right.type]) admitted[right.type] = [];
        admitted[right.type].push(right.resource)
    });
    for (let field of fields) {
        if (admitted[field] != null && admitted[field].length != 0 && element[field] != null) {
            if (Array.isArray(element[field])) { if (!admitted[field].some(r => element[field].includes(r))) return false; }
            else { if (!admitted[field].includes(element[field])) return false; }
        }
    };
    return true;
}

exports.hasRights = function (user, rights, element, where) {
    if (this.isAdministrator(user)) return true;
    if (where == 'type') {
        let admitted = {};
        rights.forEach(right => {
            right.type = right.type.toLowerCase();
            if (right.type == 'tag') right.type = right.type + 's';
            if (!admitted[right.type]) admitted[right.type] = [];
            admitted[right.type].push(right.resource)
        });
        for (let key in admitted) {
            if (Array.isArray(element[key])) { if (!element[key].some(item => admitted[key].includes(item))) return false; }
            else if (!admitted[key].includes(element[key])) return false;
        }
        return true;
    }
    else {
        if (!rights || rights.length == 0) return true;
        if (rights.map(right => right.resource).includes(element._id)) return true;
        return false;
    }
}

exports.readJustOwned = function (user) {
    if (this.isAdministrator(user)) return null;
    return { owner: user._id };
} 

exports.canDeviceOperate = async function (device, method, entity, body, paramsId,tenant) {
    if (entity == "Measurement") {
        if (paramsId) {//for get one and timeseries
            if (method == "GET" || method == "POST") {                
                const Measurement = mongoose.dbs[tenant.database].model('Measurement');
                const measurement = await Measurement.findById(paramsId);
                if (measurement.device != device._id) return [false, "The measurement required has not your device id " + device._id];
                if (!device.features) return [false, "The device has not acceptable features"];
                if (!device.things) return [false, "The device has not acceptable things"];
                if (!device.features.includes(measurement.feature)) return [false, "The feature in the measurement required is not in the list of acceptable features of the device"];
                if (!device.things.includes(measurement.thing)) return [false, "The thing in the measurement required is not in the list acceptable things of the device"];
                return [true, null];
            }
        }
        else {
            if (method == "POST") {
                if (!body) return [false, "Body of the device not found"];
                if (body.constructor == Array) {
                    let notError = [true, null];
                    if (!device.features) return [false, "The device has not acceptable features"];
                    if (!device.things) return [false, "The device has not acceptable things"];
                    body.forEach(element => {
                        if (!notError) return;
                        if (!element.feature) notError = [false, "The body of the request has not the field feature"];
                        if (!element.thing) notError = [false, "The body of the request has not the field thing"];
                        if (!device.features.includes(element.feature)) notError = [false, "The feature " + element.feature + " is not in the acceptable features of the device"];
                        if (!device.things.includes(element.thing)) notError = [false, "The thing " + element.thing + " is not in the acceptable things of the device"];
                    })
                    return notError;
                }
                if (!device.features) return [false, "The device has not acceptable features"];
                if (!device.things) return [false, "The device has not acceptable things"];
                if (!body.feature) return [false, "The body of the request has not the field feature"];
                if (!body.thing) return [false, "The body of the request has not the field thing"];
                if (!device.features.includes(body.feature)) return [false, "The feature " + body.feature + " is not in the acceptable features of the device"];
                if (!device.things.includes(body.thing)) return [false, "The thing " + body.thing + " is not in the acceptable things of the device"];
                return [true, null];
            }
        }
    }
    if ((entity == "Feature" || entity == "Thing")&& method=="GET") {
        if (paramsId) {//for get one             
            if (!device[entity.toLowerCase() + "s"]) return [false, "The device has not acceptable " + entity.toLowerCase() + "s"];
            if (!device[entity.toLowerCase() + "s"].includes(paramsId)) return [false, "The " + entity + " required is not in the list of acceptable " + entity.toLowerCase() + "s of the device"];
            return [true, null];            
        }
        else return [false, "Specify the id of the " + entity + " you want to get"];
    }
    if (entity == "Device" && method== "GET") {
        if (paramsId) {//for get one            
            if (device._id != paramsId) return [false, "A Device cannot get information of other devices"];
            return [true, null];
            
        }
        else return [false, "Specify the id of the Device you want to get"];
       
    } 
    if (entity == "Tag" && (method == "GET"|| method == "POST")) return [true, null];    
    return [false, "Device cannot do " + method.toLowerCase() + " operation on the resource " + entity];
}
