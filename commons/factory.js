const UserRoles = require("../types/userRoles");
const crypto = require("crypto");
const mongoose = require("mongoose");
const tenancy = require("./tenancy.js");
const authentication = require("../security/authentication.js");
const RelationshipTypes = require("../types/relationshipTypes");
const jwt = require("jsonwebtoken");
const ItemTypes = require("../types/itemTypes.js");
const ComputationStatusTypes = require("../types/computationStatusTypes.js");
const PasswordResetStatusTypes = require("../types/passwordResetStatusTypes.js");
//const ExperimentStateTypes = require("../types/experimentStateTypes.js");
const TopicFieldTypes = require('../types/topicFieldTypes.js');
const IssueTypes = require("../types/issueTypes.js");
const VisibilityTypes = require("../types/visibilityTypes.js");
const bcrypt = require("bcryptjs");
const UserStatusTypes = require("../types/userStatusTypes");
const IssueStatusTypes = require("../types/issueStatusTypes");
const MetadataTypes = require('../types/metadataTypes.js');
const RoleCrudTypes = require('../types/roleCrudTypes.js');
const { index } = require("mathjs");
const errors = require('../commons/errors.js');
const StageTypes = require("../types/stageTypes.js");

function sha(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

exports.addDays = function (date, days) {
  const new_date = new Date(date)
  new_date.setDate(new_date.getDate() + days)
  return new_date
}

exports.uuid = function () {
  return crypto.randomBytes(16).toString("hex");
};

exports.random = function (max) {
  return Math.floor(Math.random() * max);
};

exports.dropContents = async function (tenant) {
  try {
    const Tenant = mongoose.dbs["catalog"].model("Tenant");
    if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    for (let collection in mongoose.dbs[tenant.database].collections) {
      await mongoose.dbs[tenant.database].collections[collection].deleteMany();
    }
    await tenancy.init(tenant);
  } catch (error) {
    console.log("Error in dropping database " + tenant + "(" + error + ")");
  }
};

exports.getAdminToken = async function (tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant)
    if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const User = mongoose.dbs[tenant.database].model("User");
  const admin = await User.findOne({
    username: process.env.DEFAULT_TENANT_ADMIN_USERNAME,
  });
  return authentication.encode(admin, tenant);
};

exports.getUserToken = async function (user, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant)
    if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  return authentication.encode(user, tenant);
};

exports.getDeviceToken = async function (device, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant)
    if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  return authentication.encodeDevice(device, tenant);
};


exports.createTenant = async function (id, organization, address, email, phone, admin_username, admin_password) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  let tenant = await Tenant.findOne({ _id: id });
  if (!tenant) {
    const req = {
      _id: id || uuid(),
      database: id,
      organization: organization || uuid(),
      address: address,
      email: email,
      phone: phone,
      admin_username: admin_username,
      admin_password: admin_password,
    };
    tenant = new Tenant(req);
    await tenant.save();
  }
  await tenancy.init(tenant);
  return await Tenant.findById(tenant._id);
};

exports.createUser = async function (username, password, type, fieldmask, email, tenant, validityPasswordDays, createdPassword) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  if (tenant.passwordhash != false && tenant.passwordhash != "false") {
    password = bcrypt.hashSync(password, 8);
  }
  const User = mongoose.dbs[tenant.database].model("User");
  const req = {
    username: username,
    password: password,
    fieldmask: fieldmask,
    email: email || username + "@gmail.com",
    type: type || UserRoles.provider,
    validityPasswordDays: validityPasswordDays || 0,
    createdPassword: createdPassword
  };
  let user = new User(req);
  await user.save();

  return await User.findById(user._id);
};

exports.createRole = async function (name, defaultAction, actions, description, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Role = mongoose.dbs[tenant.database].model("Role");
  let role = await Role.findOne({ _id: name });
  if (!role) {
    const req = {
      _id: name,
      default: defaultAction,
      actions: actions,
      description: description
    };
    role = new Role(req);
    await role.save();
  }
  return role._doc;
};

exports.createCrud = async function (create, read, update, deleteAction) {
  const body = {}
  if (create === true || create === false) body.create = create;
  if (read) body.read = read;
  if (update) body.update = update;
  if (deleteAction) body.delete = deleteAction;

  return body;
};

exports.createDefaultRoles = async function (tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Role = mongoose.dbs[tenant.database].model("Role");
  const body = [{
    _id: "admin",
    default: {
      create: true,
      read: RoleCrudTypes.all,
      update: RoleCrudTypes.all,
      delete: RoleCrudTypes.all
    }
  },
  {
    _id: "provider",
    default: {
      create: true,
      read: RoleCrudTypes.public_and_owned,
      update: RoleCrudTypes.owned,
      delete: RoleCrudTypes.owned
    }
  },
  {
    _id: "supplier",
    default: {
      create: true,
      read: RoleCrudTypes.none,
      update: RoleCrudTypes.none,
      delete: RoleCrudTypes.none
    }
  },
  {
    _id: "analyst",
    default: {
      create: false,
      read: RoleCrudTypes.all,
      update: RoleCrudTypes.none,
      delete: RoleCrudTypes.none
    }
  }
  ];
  let roleDocs = []
  for (let i = 0; i < body.length; i++) {
    let role = new Role(body[i]);
    await role.save();
    roleDocs.push(role._doc)
  };
  return roleDocs;
};

exports.createGroup = async function (
  name,
  owner,
  tags,
  description,
  visibility,
  tenant,
  users
) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Group = mongoose.dbs[tenant.database].model("Group");
  const req = {
    _id: name,
    owner: owner,
    tags: tags,
    description: description,
    visibility: visibility || VisibilityTypes.private,
    users: users || []
  };
  const group = new Group(req);
  await group.save();
  return group._doc;
};

exports.createSamples = function (value, delta) {
  if (Array.isArray(value)) return [{ values: value, delta: delta }];
  else return [{ values: [value], delta: delta }];
};

exports.createSample = function (value, delta) {
  if (Array.isArray(value)) return { values: value, delta: delta };
  else return { values: [value], delta: delta };
};

exports.createTag = async function (name, owner, tags, visibility, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Tag = mongoose.dbs[tenant.database].model("Tag");
  let tag = await Tag.findOne({ _id: name });
  if (!tag) {
    const req = { _id: name, owner: owner, tags: tags, visibility: visibility };
    tag = new Tag(req);
    await tag.save();
  }
  return tag._doc;
};

exports.createFeature = async function (name, owner, items, tags, visibility, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Feature = mongoose.dbs[tenant.database].model("Feature");
  const req = {
    _id: name,
    owner: owner,
    items: items || [
      { name: "item-name-1", unit: "items-unit-1", type: ItemTypes.number },
    ],
    tags: tags,
    visibility: visibility,
  };
  const feature = new Feature(req);
  await feature.save();
  return feature._doc;
};


exports.createMetadata = async function (name, description, type, range) {
  metadata = {
    name: name || "metadata-name-" + this.uuid(),
    description: description || "description metadata " + this.uuid(),
    type: type || MetadataTypes.scalar,
    range: range || []
  }
  return metadata;
}

exports.createField = async function (name, description, type, range) {
  field = {
    name: name || "field-name-" + this.uuid(),
    description: description || "description field " + this.uuid(),
    type: type || TopicFieldTypes.scalar,
    range: range || []
  }
  return field;
}
exports.createTopic = async function (name, description, fields) {
  topic = {
    name: name || "topic-name-" + this.uuid(),
    description: description || "description topic " + this.uuid(),
    fields: fields || [await this.createField(), await this.createField()]
  }
  return topic;
}

exports.createProtocol = async function (name, description, owner, metadata, topics, tags, visibility, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Protocol = mongoose.dbs[tenant.database].model("Protocol");
  const req = {
    _id: name,
    description: description,
    owner: owner,
    metadata: metadata || [await this.createMetadata(), await this.createMetadata()],
    topics: topics || [await this.createTopic(), await this.createTopic()],
    tags: tags,
    visibility: visibility,
  };
  const protocol = new Protocol(req);
  await protocol.save();
  return protocol._doc;
};

exports.createExperimentMetadata = async function (protocol) {
  const metadata = [];
  for (let protocol_metadata of protocol.metadata) {
    value = this.random(100);
    if (protocol_metadata.type === MetadataTypes.vector) value = [this.random(100), this.random(100), this.random(100)];
    if (protocol_metadata.type === MetadataTypes.text) value = "random_text_" + this.uuid();
    experiment_metadata = { name: protocol_metadata.name, value: value }
    metadata.push(experiment_metadata);
  }
  return metadata;
}

exports.createExperimentHistory = async function (protocol, steps, start) {
  if (!start) start = 0;
  const history = [];
  for (let step = 0; step < steps; step++) {
    const protocol_fields = [];
    for (let protocol_topic of protocol.topics) protocol_fields.push(...protocol_topic.fields)
    fields = [];
    for (let field of protocol_fields) {
      value = this.random(100);
      if (field.type === TopicFieldTypes.vector) value = [this.random(100), this.random(100), this.random(100)];
      if (field.type === TopicFieldTypes.text) value = "random_text_" + this.uuid();
      fields.push({ name: field.name, value: value })
    }
    history.push({ step: step + start, timestamp: Date.now(), fields: fields })
  }
  return history;
}

exports.createExperiment = async function (name, description, owner, state, startDate, endDate, place, protocol, metadata, history, tags, manager, visibility, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Experiment = mongoose.dbs[tenant.database].model("Experiment");
  const req = {
    _id: name,
    description: description,
    //state: state || ExperimentStateTypes.ongoing,
    state: state || 0,
    startDate: startDate || Date.now(),
    endDate: endDate || Date.now(),
    owner: owner,
    place: place || [{ name: "Place", location: { type: "Point", coordinates: [12.123456, 13.1345678] } }],
    protocol: protocol,
    metadata: metadata || await this.createExperimentMetadata(protocol),
    history: history || await this.createExperimentHistory(protocol, 3),
    manager: manager || "manager1",
    tags: tags,
    visibility: visibility,
  };
  const experiment = new Experiment(req);
  await experiment.save();
  return experiment._doc;
};

exports.createDevice = async function (name, owner, features, tags, scripts, visibility, tenant, things, token) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  
  const Device = mongoose.dbs[tenant.database].model("Device");
  const req = {
    _id: name,
    owner: owner,
    tags: tags,
    scripts: scripts,
    features: features || [await this.createFeature(name + "-feature", owner)],
    visibility: visibility || VisibilityTypes.private,    
    things: things
  };
  if(!token) token = authentication.encodeDevice(req, tenant);
  if (tenant.passwordhash != false && tenant.passwordhash != "false") {
    token = bcrypt.hashSync(token, 8);
  }
  req.token=token;
  const device = new Device(req);
  await device.save();
  return device._doc;
};

exports.createIssue = async function (
  owner,
  device,
  date,
  message,
  type,
  tenant,
  status
) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Issue = mongoose.dbs[tenant.database].model("Issue");
  const req = {
    owner: owner,
    device: device,
    date: date || Date.now(),
    message: message || "this is a message",
    type: type || IssueTypes.generic,
    status: status || IssueStatusTypes.open,
    typestamp: Date.now(),
  };
  const issue = new Issue(req);
  await issue.save();
  return issue._doc;
};

exports.createConstraint = async function (
  owner,
  type1,
  type2,
  element1,
  element2,
  relationship,
  visibility,
  tags,
  tenant
) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Constraint = mongoose.dbs[tenant.database].model("Constraint");
  const req = {
    owner: owner,
    type1: type1,
    type2: type2,
    element1: element1,
    element2: element2,
    relationship: relationship,
    visibility: visibility,
    tags: tags,
  };
  const constraint = new Constraint(req);
  await constraint.save();
  return constraint._doc;
};

exports.createDataupload = async function (name, owner, timestamp, size, results, lastmod, tenant, visibility) {
  const Tenant = mongoose.dbs['catalog'].model('Tenant');
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Dataupload = mongoose.dbs[tenant.database].model('Dataupload');
  const req = {
    _id: name,
    owner: owner,
    timestamp: timestamp,
    size: size,
    results: results,
    lastmod: lastmod,
    visibility: visibility
  }
  const dataupload = new Dataupload(req);
  await dataupload.save();
  return dataupload._doc;
};

exports.createThing = async function (name, owner, tags, metadata, relations, visibility, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Thing = mongoose.dbs[tenant.database].model("Thing");
  const req = {
    _id: name,
    owner: owner,
    tags: tags,
    metadata: metadata,
    relations: relations,
    visibility: visibility || VisibilityTypes.private,
  };
  const thing = new Thing(req);
  await thing.save();
  return thing._doc;
};

exports.createScript = async function (
  name,
  owner,
  code,
  tags,
  visibility,
  tenant
) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Script = mongoose.dbs[tenant.database].model("Script");
  const req = {
    _id: name,
    owner: owner,
    tags: tags,
    code: code,
    visibility: visibility,
  };
  const script = new Script(req);
  await script.save();
  return script._doc;
};

exports.createSubscription = async function (token, owner, device, thing, tags, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Subscription = mongoose.dbs[tenant.database].model("Subscription");
  const req = {
    token: token,
    owner: owner,
    device: device,
    thing: thing,
    tags: tags,
  };
  const subscription = new Subscription(req);
  await subscription.save();
  return subscription._doc;
};

exports.createRight = async function (
  name,
  resource,
  type,
  user,
  owner,
  tags,
  tenant,
  group
) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Right = mongoose.dbs[tenant.database].model("Right");
  const req = {
    _id: name,
    resource: resource,
    type: type,
    user: user,
    owner: owner,
    tags: tags,
    group: group
  };
  const right = new Right(req);
  await right.save();
  return right._doc;
};

exports.createReset = async function (user, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const PasswordReset = mongoose.dbs[tenant.database].model("PasswordReset");
  const req = {
    user: user._id,
    status: PasswordResetStatusTypes.valid,
    created: Date.now(),
  };
  const reset = new PasswordReset(req);
  await reset.save();
  return await PasswordReset.findById(reset._id);
};

exports.createFieldmask = async function (
  name,
  computation_fields,
  device_fields,
  feature_fields,
  measurement_fields,
  script_fields,
  tag_fields,
  thing_fields,
  owner,
  tenant
) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Fieldmask = mongoose.dbs[tenant.database].model("Fieldmask");
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
  };
  const fieldmask = new Fieldmask(req);
  await fieldmask.save();
  return fieldmask._doc;
};

exports.createMeasurement = async function (owner, feature, device, thing, tags, samples, startdate, enddate, location, visibility, experiment, tenant,stage) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  if (samples == undefined) samples = [{ values: [10.4], delta: 200 }];
  const Measurement = mongoose.dbs[tenant.database].model("Measurement");
  const req = {
    owner: owner,
    startDate: startdate || Date.now(),
    endDate: enddate || Date.now(),
    location: location || { type: "Point", coordinates: [12.123456, 13.1345678] },
    thing: thing,
    feature: feature,
    device: device,
    samples: samples,
    tags: tags,
    visibility: visibility,
    experiment: experiment,
    stage: stage || StageTypes.final
  };
  const id = sha(JSON.stringify(req));
  req._id = id;
  const measurement = new Measurement(req);
  await measurement.save();
  return measurement._doc;
};

exports.createTimesample = async function (owner, values, timestamp, measurement, tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  if (!measurement) {
    const Measurement = mongoose.dbs[tenant.database].model("Measurement");
    const feature = await this.createFeature(this.uuid(), owner);
    const device = await this.createDevice(this.uuid(), owner, [feature]);
    const thing = await this.createThing(this.uuid(), owner);
    measurement = await factory.createMeasurement(owner, feature, device, thing, [], []);
  }
  const Timesample = mongoose.dbs[tenant.database].model("Timesample");
  const req = {
    measurement: measurement,
    values: values || [1],
    timestamp: timestamp || Date.now()
  }
  const timesample = new Timesample(req);
  await timesample.save();
  return await Timesample.findById(timesample._id);
};

exports.createComputation = async function (
  id,
  owner,
  code,
  feature,
  items,
  filter,
  tags,
  features,
  tenant
) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
  const Computation = mongoose.dbs[tenant.database].model("Computation");
  const req = {
    _id: id,
    owner: owner,
    code: code,
    feature: feature,
    items: items || [],
    filter: filter,
    status: ComputationStatusTypes.running,
    progress: 0,
    tags: tags,
  };
  const computation = new Computation(req);
  await computation.save();
  return computation._doc;
};

exports.createDemoContent = async function (tenant) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT_DEMO);

  const users = [];
  users.push(
    await this.createUser(
      "user-provider-name-1",
      "password",
      UserRoles.provider,
      null,
      "user1@measurify.org",
      tenant
    )
  );
  users.push(
    await this.createUser(
      "user-analyst-name-1",
      "password",
      UserRoles.analyst,
      null,
      "user2@measurify.org",
      tenant
    )
  );

  const tags = [];
  tags.push(
    await this.createTag("diesel", users[0], [], VisibilityTypes.public, tenant)
  );
  tags.push(
    await this.createTag(
      "gasoline",
      users[0],
      [],
      VisibilityTypes.public,
      tenant
    )
  );
  tags.push(
    await this.createTag("urban", users[0], [], VisibilityTypes.public, tenant)
  );
  tags.push(
    await this.createTag(
      "autoroute",
      users[0],
      [],
      VisibilityTypes.public,
      tenant
    )
  );
  tags.push(
    await this.createTag("rural", users[0], [], VisibilityTypes.public, tenant)
  );

  const features = [];
  features.push(
    await this.createFeature(
      "speed",
      users[0],
      [{ name: "value", unit: "km/h" }],
      [],
      VisibilityTypes.public,
      tenant
    )
  );
  features.push(
    await this.createFeature(
      "acceleration",
      users[0],
      [{ name: "value", unit: "km/h2" }],
      [],
      VisibilityTypes.public,
      tenant
    )
  );

  const script = [];
  script.push(
    await this.createScript(
      "script-speedometer-rural",
      users[0],
      "source code speedometer",
      ["rural"],
      VisibilityTypes.public,
      tenant
    )
  );
  script.push(
    await this.createScript(
      "script-accelerometer-rural",
      users[0],
      "source code accelometer",
      ["rural"],
      VisibilityTypes.public,
      tenant
    )
  );
  script.push(
    await this.createScript(
      "script-speedometer-urban",
      users[0],
      "source code speedometer",
      ["urban"],
      VisibilityTypes.public,
      tenant
    )
  );
  script.push(
    await this.createScript(
      "script-accelerometer-urban",
      users[0],
      "source code accelometer",
      ["urban"],
      VisibilityTypes.public,
      tenant
    )
  );

  const devices = [];
  devices.push(
    await this.createDevice(
      "speedometer",
      users[0],
      ["speed"],
      [],
      ["script-speedometer-rural", "script-speedometer-urban"],
      VisibilityTypes.public,
      tenant
    )
  );
  devices.push(
    await this.createDevice(
      "accelerometer",
      users[0],
      ["acceleration"],
      [],
      ["script-accelerometer-rural", "script-accelerometer-urban"],
      VisibilityTypes.public,
      tenant
    )
  );

  const things = [];
  things.push(
    await this.createThing(
      "car1",
      users[0],
      ["diesel"],
      null,
      null,
      VisibilityTypes.public,
      tenant
    )
  );
  things.push(
    await this.createThing(
      "car2",
      users[0],
      ["gasoline"],
      null,
      null,
      VisibilityTypes.public,
      tenant
    )
  );
  things.push(
    await this.createThing(
      "car3",
      users[0],
      ["gasoline"],
      null,
      null,
      VisibilityTypes.public,
      tenant
    )
  );

  const constraints = [];
  constraints.push(
    await this.createConstraint(
      users[0],
      "Tag",
      "Device",
      tags[0]._id,
      devices[0]._id,
      RelationshipTypes.dependency,
      VisibilityTypes.public,
      [],
      tenant
    )
  );
  constraints.push(
    await this.createConstraint(
      users[0],
      "Tag",
      "Device",
      tags[1]._id,
      devices[0]._id,
      RelationshipTypes.dependency,
      VisibilityTypes.public,
      [],
      tenant
    )
  );
  constraints.push(
    await this.createConstraint(
      users[0],
      "Tag",
      "Device",
      tags[2]._id,
      devices[1]._id,
      RelationshipTypes.dependency,
      VisibilityTypes.public,
      [],
      tenant
    )
  );

  const rights = [];
  rights.push(
    await this.createRight(
      "right-1",
      things[0],
      "Thing",
      users[1],
      users[0],
      [],
      tenant
    )
  );
  rights.push(
    await this.createRight(
      "right-2",
      things[1],
      "Thing",
      users[1],
      users[0],
      [],
      tenant
    )
  );

  const measurements = [];
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car1",
      ["urban"],
      [{ values: [60], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car2",
      ["urban"],
      [{ values: [80], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car3",
      ["autoroute"],
      [{ values: [95], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car1",
      ["urban"],
      [{ values: [160], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car1",
      ["autoroute"],
      [{ values: [130], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car2",
      ["rural"],
      [{ values: [20], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car2",
      ["urban"],
      [{ values: [40], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car1",
      ["rural"],
      [{ values: [55], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car3",
      ["rural"],
      [{ values: [65], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "speed",
      "speedometer",
      "car1",
      ["rural"],
      [{ values: [73], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "acceleration",
      "accelerometer",
      "car1",
      ["rural"],
      [{ values: [3.1], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "acceleration",
      "accelerometer",
      "car1",
      ["urban"],
      [{ values: [4.3], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "acceleration",
      "accelerometer",
      "car3",
      ["autoroute"],
      [{ values: [4.5], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "acceleration",
      "accelerometer",
      "car1",
      ["urban"],
      [{ values: [1.2], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "acceleration",
      "accelerometer",
      "car2",
      ["autoroute"],
      [{ values: [2.7], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
  measurements.push(
    await this.createMeasurement(
      users[0],
      "acceleration",
      "accelerometer",
      "car2",
      ["urban"],
      [{ values: [3.1], delta: 0 }],
      null,
      null,
      null,
      VisibilityTypes.public,
      null,
      tenant
    )
  );
};

//check if two objects (arrays, variables or objects) are equal
exports.areEqual = function areEqual(obj1, obj2) {
  //undefined check
  if (obj1 === undefined || obj2 === undefined) return false;
  //single value and ref check
  if (obj1 === obj2) return true;
  if (typeof obj1 !== typeof obj2) return false;
  //one is array, other isn't
  if (
    (Array.isArray(obj1) && !Array.isArray(obj2)) ||
    (!Array.isArray(obj1) && Array.isArray(obj2))
  )
    return false;
  //both are array
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    //different length => not equal
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!areEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }
  //one is object, other isn't
  if (
    (obj1.constructor === Object && obj2.constructor !== Object) ||
    (obj1.constructor !== Object && obj2.constructor === Object)
  )
    return false;
  //both are object
  if (obj1.constructor === Object && obj2.constructor === Object) {
    const k1 = Object.keys(obj1);
    const k2 = Object.keys(obj2);
    if (k1.length !== k2.length) return false;
    if (!areEqual(k1, k2)) return false;
    const v1 = Object.values(obj1);
    const v2 = Object.values(obj2);
    if (!areEqual(v1, v2)) return false;
    return true;
  }
  return false;
};

exports.HashDeviceToken = async function (tenant, token) {
  const Tenant = mongoose.dbs["catalog"].model("Tenant");
  if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);  
  if (tenant.passwordhash != false && tenant.passwordhash != "false") {
    token = bcrypt.hashSync(token, 8);
  }
  return token;
};