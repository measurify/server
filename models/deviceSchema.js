const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const MeasurementBufferPolicyTypes = require('../types/measurementBufferPolicyTypes.js'); 
 
/**
 * @swagger
 * definitions:
 *      device:
 *          type: object
 *          required:
 *              - _id
 *              - features
 *              - owner
 *          properties:
 *              _id: 
 *                  type: string
 *              features: 
 *                  description: list of features sensed by the device
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/feature'
 *              owner:
 *                  description: the user how creates the device
 *                  type: 
 *                      $ref: '#/paths/definitions/tag'
 *              tags: 
 *                  description: list of labels related to the device
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/tag'
 */
const deviceSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    features: { type: [String], required: "Please, supply a feature array", ref:'Feature' },
    tags: { type: [String], ref:'Tag' },
    scripts: { type: [String], ref:'Script' },
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    period: {type: String, default: "5s" },
    cycle: {type: String, default: "10m" },
    retryTime: {type: String, default: "10s" },
    scriptListMaxSize: {type: Number, default: 5 },
    measurementBufferSize: {type: Number, default: 20 },
    issueBufferSize: {type: Number, default: 20 },
    sendBufferSize: {type: Number, default: 20 },
    scriptStatementMaxSize: {type: Number, default: 5 },
    statementBufferSize: {type: Number, default: 10 },
    measurementBufferPolicy: {type: String, enum: MeasurementBufferPolicyTypes, default: MeasurementBufferPolicyTypes.newest },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

deviceSchema.set('toJSON', { versionKey: false });
deviceSchema.index({ owner: 1 });
deviceSchema.index({ timestamp: 1 });
deviceSchema.plugin(paginate);
deviceSchema.plugin(require('mongoose-autopopulate'));

// validate features
deviceSchema.path('features').validate({
    validator: function (value) {
        if(!value) return false;
        if(value.length < 1) return false;
        return true;
    },
    message: 'Please, supply at least one feature'
});

deviceSchema.path('features').validate({
    validator: async function (value) {
        const Feature = this.constructor.model('Feature');
        for(let i=0; i<value.length; i++) {
            let feature = await Feature.findById(value[i]);
            if(!feature) throw new Error('Feature not existent (' + value[i] + ')');
        };
        return true;
    }
});

// validate tags
deviceSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
        if(!values) return true;
        for(let i=0; i<values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if(!tag) return false;
        };
        return true;
    },
    message: 'Tag not existent'
});

// check buffer policy
deviceSchema.pre('save', async function() {
    if(!this.measurementBufferPolicy) throw new Error('Issue validation failed: supply an measurement buffer policy');  
    if(!Object.values(MeasurementBufferPolicyTypes).includes(this.measurementBufferPolicy)) throw new Error('Issue validation failed: unrecognized measurement buffer policy');                      
});

// validate scripts
deviceSchema.path('scripts').validate({
    validator: async function (values) {
        const Script = this.constructor.model('Script');
        if(!values) return true;
        for(let i=0; i<values.length; i++) {
            let script = await Script.findById(values[i]);
            if(!script) return false;
        };
        return true;
    },
    message: 'Script not existent'
});

// validate owner
deviceSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if(!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate id
deviceSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Device validation failed: the _id is already used (' + this._id + ')');
});

module.exports = deviceSchema;
