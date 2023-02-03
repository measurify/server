const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const MeasurementBufferPolicyTypes = require('../types/measurementBufferPolicyTypes.js'); 
 
const deviceSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    token: { type: String, unique: true, select: false },
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
/*
deviceSchema.path('features').validate({
    validator: function (value) {
        if(!value) return false;
        if(value.length < 1) return false;
        return true;
    },
    message: 'Please, supply at least one feature'
});
*/

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

module.exports = deviceSchema;
