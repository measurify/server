const UserRoles = require('../types/userRoles');
const crypto = require("crypto");
const mongoose = require('mongoose');
const tenancy = require('./tenancy.js');
const authentication = require('../security/authentication.js');
const RelationshipTypes = require('../types/relationshipTypes');
const jwt = require('jsonwebtoken');
const ItemTypes = require('../types/itemTypes.js');
const ComputationStatusTypes = require('../types/computationStatusTypes.js'); 
const PasswordResetStatusTypes = require('../types/passwordResetStatusTypes.js');
const IssueTypes = require('../types/issueTypes.js');
const VisibilityTypes = require('../types/visibilityTypes.js');
const bcrypt = require('bcryptjs');
const UserStatusTypes = require('../types/userStatusTypes');
const StatusTypes = require('../types/statusTypes');

exports.uuid = function() {  return crypto.randomBytes(16).toString("hex"); }

exports.random = function(max) { return Math.floor(Math.random() * max); }

exports.dropContents = async function(tenant){  
    try{
        const Tenant = mongoose.dbs['catalog'].model('Tenant');  
        if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
        for (let collection in mongoose.dbs[tenant.database].collections) { await mongoose.dbs[tenant.database].collections[collection].deleteMany(); };  
        tenancy.init(tenant);   
    }
    catch (error) { console.log('Error in dropping databae ' + tenant + '('+ error + ')')} 
}

exports.getAdminToken = async function(tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const User = mongoose.dbs[tenant.database].model('User');
    const admin = await User.findOne({ username: process.env.DEFAULT_TENANT_ADMIN_USERNAME });
    return authentication.encode(admin, tenant);
};

exports.getUserToken = async function(user, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    return authentication.encode(user, tenant);
};

exports.createTenant = async function(id, organization, address, email, phone, admin_username, admin_password) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let tenant = await Tenant.findOne( { _id: id });
    if(!tenant) {
        const req = { 
            _id: id || uuid(),
            database: id,
            organization: organization ||  uuid(),
            address: address,
            email: email,
            phone: phone,
            admin_username: admin_username,
            admin_password: admin_password 
        };
        tenant = new Tenant(req);
        await tenant.save();
    }
    await tenancy.init(tenant);
    return await Tenant.findById(tenant._id);
};

exports.createUser = async function(username, password, type, fieldmask, email, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    if(tenant.passwordhash == true || tenant.passwordhash == 'true') { password = bcrypt.hashSync(password, 8); }
    const User = mongoose.dbs[tenant.database].model('User');
    let user = await User.findOne( { username: username });
    if(!user) {
        const req = { 
            username: username,
            password: password,
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

exports.createTag = async function(name, owner, tags, visibility, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Tag = mongoose.dbs[tenant.database].model('Tag');
    let tag = await Tag.findOne( { _id: name });
    if(!tag) {
        const req = { _id: name , owner: owner, tags: tags, visibility: visibility }
        tag = new Tag(req);
        await tag.save();
    }
    return tag._doc;
};

exports.createFeature = async function(name, owner, items, tags, visibility, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Feature = mongoose.dbs[tenant.database].model('Feature');
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

exports.createDevice = async function(name, owner, features, tags, scripts, visibility, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Device = mongoose.dbs[tenant.database].model('Device');
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

exports.createIssue = async function(owner, device, date, message, type, tenant, status) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Issue = mongoose.dbs[tenant.database].model('Issue');
    const req = { 
        owner: owner,
        device: device,
        date: date || Date.now(),
        message: message || "this is a message",
        type: type || IssueTypes.generic,
        status: status || StatusTypes.open,
        typestamp: Date.now()
    }
    const issue = new Issue(req);
    await issue.save();
    return issue._doc;
};

exports.createConstraint = async function(owner, type1, type2, element1, element2, relationship, visibility, tags, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Constraint = mongoose.dbs[tenant.database].model('Constraint');
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

exports.createThing = async function(name, owner, tags, metadata, relations, visibility, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Thing = mongoose.dbs[tenant.database].model('Thing');
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

exports.createScript = async function(name, owner, code, tags, visibility, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Script = mongoose.dbs[tenant.database].model('Script');
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

exports.createSubscription = async function(token, owner, device, thing, tags, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Subscription = mongoose.dbs[tenant.database].model('Subscription');
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

exports.createRight = async function(name, resource, type, user, owner, tags, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Right = mongoose.dbs[tenant.database].model('Right');
    const req = { 
        _id: name,
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

exports.createReset = async function(user, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const PasswordReset = mongoose.dbs[tenant.database].model('PasswordReset');
    const req = { user: user._id, status: PasswordResetStatusTypes.valid , created: Date.now() };
    const reset = new PasswordReset(req);
    await reset.save();
    return await PasswordReset.findById(reset._id);
}

exports.createFieldmask = async function(name, computation_fields, device_fields, feature_fields, measurement_fields, script_fields, tag_fields, thing_fields, owner, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Fieldmask = mongoose.dbs[tenant.database].model('Fieldmask');
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

exports.createMeasurement = async function(owner, feature, device, thing, tags, samples, startdate, enddate, location, visibility, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Measurement = mongoose.dbs[tenant.database].model('Measurement');
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

exports.createComputation = async function(id, owner, code, feature, items, filter, tags, features, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Computation = mongoose.dbs[tenant.database].model('Computation');
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

exports.createDemoContent = async function(tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if(!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);

    const users = [];
    users.push(await this.createUser('user-provider-name-1','password', UserRoles.provider, null, "user1@measurify.org", tenant));
    users.push(await this.createUser('user-analyst-name-1', 'password', UserRoles.analyst, null, "user2@measurify.org", tenant));

    const tags = [];
    tags.push(await this.createTag('diesel', users[0], [], VisibilityTypes.public, tenant));
    tags.push(await this.createTag('gasoline', users[0], [], VisibilityTypes.public, tenant));
    tags.push(await this.createTag('urban', users[0], [], VisibilityTypes.public, tenant));
    tags.push(await this.createTag('autoroute', users[0], [], VisibilityTypes.public, tenant));
    tags.push(await this.createTag('rural', users[0], [], VisibilityTypes.public, tenant));

    const features = [];
    features.push(await this.createFeature("speed", users[0], [{name: "value", unit: "km/h"}], [], VisibilityTypes.public, tenant));
    features.push(await this.createFeature("acceleration", users[0], [{name: "value", unit: "km/h2"}], [], VisibilityTypes.public, tenant));

    const script = [];
    script.push(await this.createScript("script-speedometer-rural", users[0], "source code speedometer", ["rural"], VisibilityTypes.public, tenant));
    script.push(await this.createScript("script-accelerometer-rural", users[0], "source code accelometer", ["rural"], VisibilityTypes.public, tenant));
    script.push(await this.createScript("script-speedometer-urban", users[0], "source code speedometer", ["urban"], VisibilityTypes.public, tenant));
    script.push(await this.createScript("script-accelerometer-urban", users[0], "source code accelometer", ["urban"], VisibilityTypes.public, tenant));

    const devices = [];
    devices.push(await this.createDevice("speedometer", users[0], ["speed"], [], ["script-speedometer-rural", "script-speedometer-urban"], VisibilityTypes.public, tenant));
    devices.push(await this.createDevice("accelerometer", users[0], ["acceleration"], [], ["script-accelerometer-rural", "script-accelerometer-urban"], VisibilityTypes.public, tenant));
    
    const things = [];
    things.push(await this.createThing("car1", users[0], ["diesel"], null, null, VisibilityTypes.public, tenant));
    things.push(await this.createThing("car2", users[0], ["gasoline"], null, null, VisibilityTypes.public, tenant));
    things.push(await this.createThing("car3", users[0], ["gasoline"], null, null, VisibilityTypes.public, tenant));

    const constraints = [];
    constraints.push(await this.createConstraint(users[0], "Tag", "Device", tags[0]._id, devices[0]._id, RelationshipTypes.dependency, VisibilityTypes.public, [], tenant));
    constraints.push(await this.createConstraint(users[0], "Tag", "Device", tags[1]._id, devices[0]._id, RelationshipTypes.dependency, VisibilityTypes.public, [], tenant));
    constraints.push(await this.createConstraint(users[0], "Tag", "Device", tags[2]._id, devices[1]._id, RelationshipTypes.dependency, VisibilityTypes.public, [], tenant));

    const rights = [];
    rights.push(await this.createRight("right-1", things[0], "Thing", users[1], users[0], [], tenant));
    rights.push(await this.createRight("right-2", things[1], "Thing", users[1] , users[0], [], tenant));
 
    const measurements = [];
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["urban"], [{values: [60], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car2", ["urban"], [{values: [80], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car3", ["autoroute"], [{values: [95], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["urban"], [{values: [160], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["autoroute"], [{values: [130], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car2", ["rural"], [{values: [20], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car2", ["urban"], [{values: [40], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["rural"], [{values: [55], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car3", ["rural"], [{values: [65], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "speed", "speedometer", "car1", ["rural"], [{values: [73], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car1", ["rural"], [{values: [3.1], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car1", ["urban"], [{values: [4.3], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car3", ["autoroute"], [{values: [4.5], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car1", ["urban"], [{values: [1.2], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car2", ["autoroute"], [{values: [2.7], delta: 0}], null, null, null, VisibilityTypes.public, tenant));
    measurements.push(await this.createMeasurement(users[0], "acceleration", "accelerometer", "car2", ["urban"], [{values: [3.1], delta: 0}], null, null, null, VisibilityTypes.public, tenant));   
}
