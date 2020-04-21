const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

/**
 * @swagger
 * definitions:
 *      constraint:
 *          type: object
 *          properties:
 *       
 */
const fieldmaskSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    computation_fields: [{ type: String }],
    device_fields: [{ type: String }],
    feature_fields: [{ type: String }],
    measurement_fields: [{ type: String }],
    script_fields: [{ type: String }],
    tag_fields: [{ type: String }],
    thing_fields: [{ type: String }],
    owner: { type: String, required: true },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

fieldmaskSchema.set('toJSON', { versionKey: false });
fieldmaskSchema.index({ resource: 1 });
fieldmaskSchema.plugin(paginate);
fieldmaskSchema.plugin(require('mongoose-autopopulate'));

// check properties existence
fieldmaskSchema.pre('save', async function() {
    const properties = ['computation_fields', 'device_fields', 'feature_fields', 'measurement_fields', 'script_fields', 'tag_fields', 'thing_fields' ];
    const resource = this;
    if(!properties.some(function (property) { 
        if(resource[property] == null || resource[property].length == 0) return false;
        return true;
    })) throw new Error('Fieldschema validation failed: supply at least one not empty property');
});

// check properties values
fieldmaskSchema.pre('save', async function() {
    const properties = ['computation_fields', 'device_fields', 'feature_fields', 'measurement_fields', 'script_fields', 'tag_fields', 'thing_fields' ];
    const resource = this;
    if(properties.every(function (property) {
        const request_fields = resource[property];
        if(!request_fields || request_fields == 0) return true;
        const model_fields = Object.keys(mongoose.model((property.charAt(0).toUpperCase() + property.slice(1)).replace('_fields','')).schema.paths);
        if(!request_fields.every(request_field => model_fields.indexOf(request_field) > -1)) throw new Error('Fieldschema validation failed: supply valid computation fields'); 
    }));
});

// validate id
fieldmaskSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Fieldmask validation failed: the _id is already used (' + this._id + ')');
});

module.exports = mongoose.models.Fieldmask || mongoose.model('Fieldmask', fieldmaskSchema);
