const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const RoleCrudTypes = require('../types/roleCrudTypes.js');
const fs = require('fs');

mongoose.Promise = global.Promise;

const crudSchema = new mongoose.Schema({
    create: { type: Boolean },
    read: { type: String, enum: RoleCrudTypes },
    update: { type: String, enum: RoleCrudTypes },
    delete: { type: String, enum: RoleCrudTypes }
},
    { _id: false }
);

const actionSchema = new mongoose.Schema({
    entity: { type: String },
    crud: crudSchema
},
    { _id: false }
);

const roleSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    description: { type: String },
    default: { type: crudSchema, required: "Please, supply a default action schema"},
    actions: [actionSchema]
},
);

roleSchema.set('toJSON', { versionKey: false });
roleSchema.plugin(paginate);
roleSchema.plugin(require('mongoose-autopopulate'));

// validate entity
actionSchema.path('entity').validate({
    validator: async function (value) {
        const models = await fs.readdirSync('./models/');
        const model_name=[];
        for (let i = 0; i < models.length; i++) {
            if (models[i] == "tenantSchema.js") continue;
            if (models[i] == "logSchema.js") continue;
            model_name.push( models[i].substring(0, models[i].length - 9).toLowerCase());
        }
        if(model_name.includes(value.toLowerCase()))return true;
        throw new Error('Role validation failed: ' + value + ' is not a valid entity name (please check to use singular to define entity Ex: tag )');
    }
});

// validate default
roleSchema.path('default').validate({
    validator: async function (value) {
        if(!(value.create===false||value.create===true))throw new Error('Role validation failed: default doesn\'t have create action');
        if(!value.read)throw new Error('Role validation failed: default doesn\'t have read action');
        if(!value.update)throw new Error('Role validation failed: default doesn\'t have update action');
        if(!value.delete)throw new Error('Role validation failed: default doesn\'t have delete action');
        return true;
    }
});


module.exports = roleSchema;