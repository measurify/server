require('../models/userSchema');

const UserRoles = require('../types/userRoles');
const crypto = require("crypto");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Thing = mongoose.model('Thing');
const Tag = mongoose.model('Tag');
const Script = mongoose.model('Script');
const Feature = mongoose.model('Feature');
const Device = mongoose.model('Device');
const Constraint = mongoose.model('Constraint');
const Measurement = mongoose.model('Measurement');
const PasswordReset = mongoose.model('PasswordReset');
const Issue = mongoose.model('Issue');
const Computation = mongoose.model('Computation');
const Right = mongoose.model('Right');
const Fieldmask = mongoose.model('Fieldmask');
const Subscription = mongoose.model('Subscription');
const RelationshipTypes = require('../types/relationshipTypes');
const jwt = require('jsonwebtoken');
const ItemTypes = require('../types/itemTypes.js');
const ComputationStatusTypes = require('../types/computationStatusTypes.js'); 
const PasswordResetStatusTypes = require('../types/passwordResetStatusTypes.js');
const IssueTypes = require('../types/issueTypes.js');
const bcrypt = require('bcryptjs');


exports.uuid = function() { 
    return crypto.randomBytes(16).toString("hex"); 
}

exports.random = function(max) {
    return Math.floor(Math.random() * max);
}

exports.dropContents = async function(){  
    try{  
        await mongoose.connection.dropDatabase(); 
        await this.createSuperAdministrator();
    }
    catch (error) {} 
}

exports.createSuperAdministrator = async function() {
    return await this.createUser(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, UserRoles.admin);
};

exports.getAdminToken = async function() {
    const admin = await User.findOne({ username: process.env.ADMIN_USERNAME });
    const token = jwt.sign(admin.toJSON(), process.env.JWTSECRET);
    return 'JWT ' + token;
};

exports.getUserToken = async function(user) {
    const token = jwt.sign(user.toJSON(), process.env.JWTSECRET);
    return 'JWT ' + token;
};

exports.createDemoContent = async function() {
    const users = [];
    users.push(await this.createUser('user-provider-name-1', 'provider-password-1', UserRoles.provider));
    users.push(await this.createUser('user-analyst-name-1', 'analyst-password-1', UserRoles.analyst));

    const tags = [];
    tags.push(await this.createTag('diesel', users[0]));
    tags.push(await this.createTag('gasoline', users[0]));
    tags.push(await this.createTag('urban', users[0]));
    tags.push(await this.createTag('autoroute', users[0]));
    tags.push(await this.createTag('rural', users[0]));

    const features = [];
    features.push(await this.createFeature("speed", users[0], [{name: "value", unit: "km/h"}]));
    features.push(await this.createFeature("acceleration", users[0], [{name: "value", unit: "km/h2"}]));

    const script = [];
    script.push(await this.createScript("script-speedometer-rural", users[0], "source code speedometer", ["rural"]));
    script.push(await this.createScript("script-accelerometer-rural", users[0], "source code accelometer", ["rural"]));
    script.push(await this.createScript("script-speedometer-urban", users[0], "source code speedometer", ["urban"]));
    script.push(await this.createScript("script-accelerometer-urban", users[0], "source code accelometer", ["urban"]));

    const devices = [];
    devices.push(await this.createDevice("speedometer", users[0], ["speed"], [], ["script-speedometer-rural", "script-speedometer-urban"]));
    devices.push(await this.createDevice("accelerometer", users[0], ["acceleration"], [], ["script-accelerometer-rural", "script-accelerometer-urban"]));

    const things = [];
    things.push(await this.createThing("car1", users[0], ["diesel"] ));
    things.push(await this.createThing("car2", users[0], ["gasoline"]));
    things.push(await this.createThing("car3", users[0], ["gasoline"]))

    const constraints = [];
    constraints.push(await this.createConstraint(users[0], "Tag", "Device", tags[0]._id, devices[0]._id, RelationshipTypes.dependency ));
    constraints.push(await this.createConstraint(users[0], "Tag", "Device", tags[1]._id, devices[0]._id, RelationshipTypes.dependency ));
    constraints.push(await this.createConstraint(users[0], "Tag", "Device", tags[2]._id, devices[1]._id, RelationshipTypes.dependency ));

    const rights = [];
    rights.push(await this.createRight(things[0], "Thing", users[1], users[0], []));
    rights.push(await this.createRight(things[1], "Thing", users[1] , users[0], []));
 
    const measurements = [];
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["urban"], [{values: [60], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car2", ["urban"], [{values: [80], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car3", ["autoroute"], [{values: [95], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["urban"], [{values: [160], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["autoroute"], [{values: [130], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car2", ["rural"], [{values: [20], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car2", ["urban"], [{values: [40], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["rural"], [{values: [55], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car3", ["rural"], [{values: [65], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["rural"], [{values: [73], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car1", ["rural"], [{values: [3.1], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car1", ["urban"], [{values: [4.3], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car3", ["autoroute"], [{values: [4.5], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car1", ["urban"], [{values: [1.2], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car2", ["autoroute"], [{values: [2.7], delta: 0}]));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car2", ["urban"], [{values: [3.1], delta: 0}]));                                              
}

exports.createUser = async function(username, password, type, fieldmask, email) {
    let user = await User.findOne( { username: username });
    if(!user) {
        const req = { 
            username: username || uuid(),
            password: password ||  uuid(),
            fieldmask: fieldmask,
            email: email,
            type: type || UserRoles.provider };
        user = new User(req);
        await user.save();
    }
    return await User.findById(user._id);
};

exports.createSamples = function (value, delta) {
    if (Array.isArray(value)) return [ { values: value, delta: delta } ]
    else return [ { values: [value], delta: delta } ]
}

exports.createSample = function (value, delta) {
    if (Array.isArray(value)) return { values: value, delta: delta }
    else return { values: [value], delta: delta }
}

exports.createTag = async function(name, owner, tags, visibility) {
    let tag = await Tag.findOne( { _id: name });
    if(!tag) {
        const req = { _id: name , owner: owner, tags: tags, visibility: visibility }
        tag = new Tag(req);
        await tag.save();
    }
    return tag._doc;
};

exports.createFeature = async function(name, owner, items, tags, visibility) {
    const req = { 
        _id: name,
        owner: owner,
        items: items || [ { name: "item-name-1", unit: "items-unit-1", type: ItemTypes.number  } ],
        tags: tags,
        visibility: visibility
    }
    const feature = new Feature(req);
    await feature.save();
    return feature._doc;
};

exports.createDevice = async function(name, owner, features, tags, scripts, visibility) {
    const req = { 
        _id: name,
        owner: owner,
        tags: tags,
        scripts: scripts,
        features: features || [await this.createFeature(name + '-feature', owner)],
        visibility: visibility
    }
    const device = new Device(req);
    await device.save();
    return device._doc;
};

exports.createIssue = async function(owner, device, date, message, type) {
    const req = { 
        owner: owner,
        device: device,
        date: date || Date.now(),
        message: message || "this is a message",
        type: type || IssueTypes.generic,
        typestamp: Date.now()
    }
    const issue = new Issue(req);
    await issue.save();
    return issue._doc;
};

exports.createConstraint = async function(owner, type1, type2, element1, element2, relationship, visibility, tags) {
    const req = { 
        owner: owner,
        type1: type1,
        type2: type2,
        element1: element1,
        element2: element2,
        relationship: relationship,
        visibility: visibility,
        tags: tags
    }
    const constraint = new Constraint(req);
    await constraint.save();
    return constraint._doc;
};

exports.createThing = async function(name, owner, tags, metadata, relations, visibility) {
    const req = { 
        _id: name,
        owner: owner,
        tags: tags,
        metadata: metadata,
        relations: relations,
        visibility: visibility
    }
    const thing = new Thing(req);
    await thing.save();
    return thing._doc;
};

exports.createScript = async function(name, owner, code, tags, visibility) {
    const req = { 
        _id: name,
        owner: owner,
        tags: tags,
        code: code,
        visibility: visibility
    }
    const script = new Script(req);
    await script.save();
    return script._doc;
};

exports.createSubscription = async function(token, owner, device, thing, tags) {
    const req = { 
        token: token,
        owner: owner,
        device: device,
        thing: thing,
        tags: tags
    }
    const subscription = new Subscription(req);
    await subscription.save();
    return subscription._doc;
};

exports.createRight = async function(resource, type, user, owner, tags) {
    const req = { 
        resource: resource,
        type: type,
        user: user,
        owner: owner,
        tags: tags
    }
    const right = new Right(req);
    await right.save();
    return right._doc;
};

exports.createReset = async function(user) {
    const req = { user: user._id, status: PasswordResetStatusTypes.valid , created: Date.now() };
    const reset = new PasswordReset(req);
    await reset.save();
    return await PasswordReset.findById(reset._id);
}

exports.createFieldmask = async function(name, computation_fields, device_fields, feature_fields, measurement_fields, script_fields, tag_fields, thing_fields, owner) {
    const req = { 
        _id: name,
        computation_fields: computation_fields,
        device_fields: device_fields,
        feature_fields: feature_fields,
        measurement_fields: measurement_fields,
        script_fields: script_fields,
        tag_fields: tag_fields,
        thing_fields: thing_fields,
        owner: owner,
    }
    const fieldmask = new Fieldmask(req);
    await fieldmask.save();
    return fieldmask._doc;
};

exports.createMeasurement = async function(owner, feature, device, thing, tags, samples, startdate, enddate, location, visibility) {
    const req = {
        owner: owner,
        startDate: startdate || Date.now(),
        endDate: enddate || Date.now(),
        location: location || { type: "Point", coordinates: [12.123456, 13.1345678] },
        thing: thing,
        feature: feature,
        device: device,
        samples: samples || [ { values: [10.4], delta: 200 } ],
        tags: tags,
        visibility: visibility
    }
    const measurement = new Measurement(req);
    await measurement.save();
    return measurement._doc;
};

exports.createComputation = async function(id, owner, code, feature, items, filter, tags, features) {
    const req = { 
        _id: id,
        owner: owner,
        code: code,
        feature: feature,
        items: items || [],
        filter: filter,
        status: ComputationStatusTypes.running,
        progress: 0,
        tags: tags
    }
    const computation = new Computation(req);
    await computation.save();
    return computation._doc;
};

