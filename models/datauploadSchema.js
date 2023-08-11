const mongoose = require('mongoose');
const geojson = require('mongoose-geojson-schema');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const inspector = require('../commons/inspector.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const cache = require('../commons/cache.js');
const StageTypes = require("../types/stageTypes.js");

const datauploadSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },//corrisponde a file name
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    timestamp: { type: Date, default: Date.now },
    size: {type: Number, default: 0 },
    results: { type: String, default: ""},
    lastmod: {type: Date, default: Date.now, select: false },//per la put
    stage: { type: String, enum: StageTypes, default: StageTypes.final },
    
});

datauploadSchema.set('toJSON', { versionKey: false });
datauploadSchema.index({ owner: 1 });
datauploadSchema.index({ timestamp: -1 });
datauploadSchema.plugin(paginate);
datauploadSchema.plugin(require('mongoose-autopopulate'));


// validate owner
datauploadSchema.path('owner').validate({
    validator: async function (value) {
        if(cache.get(value.toString()+"_user")) return true;        
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
        cache.set(value.toString()+"_user", user);
        return true;
    }
});

/*
// validate feature
measurementSchema.path('feature').validate({
    validator: async function (value) {
        if(cache.get(value+"_feature")) return true;
        const Feature = this.constructor.model('Feature');
        const feature = await Feature.findById(value);
        if (!feature) throw new Error('Feature not existent (' + value + ')');
        cache.set(value+"_feature", feature);
        return true;
    }
});

// validate script
measurementSchema.path('script').validate({
    validator: async function (value) {
        if(cache.get(value+"_script")) return true;
        const Script = this.constructor.model('Script');
        const script = await Script.findById(value);
        if (!script) throw new Error('Script not existent (' + value + ')');
        cache.set(value+"_script", script);
        return true;
    }
});

// validate thing
measurementSchema.path('thing').validate({
    validator: async function (value) {
        if(cache.get(value+"_thing")) return true;
        const Thing = this.constructor.model('Thing');
        const thing = await Thing.findById(value);
        if (!thing) throw new Error('Thing not existent (' + value + ')');
        cache.set(value+"_thing", thing);
        return true;
    }
});

// validate device
measurementSchema.path('device').validate({
    validator: async function (value) {
        if(cache.get(value+"_device")) return true;
        const Device = this.constructor.model('Device');
        const device = await Device.findById(value);
        if (!device) throw new Error('Device not existent (' + value + ')');
        cache.set(value+"_device", device);
        return true;
    }
});

// validate tags
measurementSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
        for (let value of values) {
            if(!cache.get(value+"_tag")){ 
                const tag = await Tag.findById(value);
                if (!tag) throw new Error('Tag not existent (' + value + ')');
                cache.set(value+"_tag", tag);
            }
        };
        return true;
    }
});



// check samples
measurementSchema.pre('save', async function () {
    if(!inspector.hasSamples(this)) throw new Error('No samples specified for this measurement');
    let removes = []; 
    for (let sample of this.samples)
        if(!inspector.hasValues(sample)) removes.push(sample);
    this.samples.remove(removes);
});

// check consistency between samples and feature
measurementSchema.pre('save', async function () {
    let feature = cache.get(this.feature+"_feature");
    if(!feature) {
        const Feature = this.constructor.model('Feature');
        feature = (await Feature.findById(this.feature));
        cache.set(this.feature+"_feature", feature);
    }
    let result = inspector.areCoherent(this, feature);
    if(result != true) throw new Error(result);
});

// check consistency between device and feature
measurementSchema.pre('save', async function () {
    let feature = cache.get(this.feature+"_feature");
    if(!feature) {
        const Feature = this.constructor.model('Feature');
        feature = await Feature.findById(this.feature);
    }
    let device = cache.get(this.device+"_device");
    if(!device) {
        const Device = this.constructor.model('Device');
        device = await Device.findById(this.device);
    }
    if(!device.features.includes(feature._id)) throw new Error("No match between device features and measurement feature (" + feature._id + ")");
});

// check if already have a similar measurement (idempotent)
// same start/end date, thing, device and feature

measurementSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { feature: this.feature,
                                                  startDate: this.startDate,
                                                  endDate: this.endDate,
                                                  thing:  this.thing,
                                                  script: this.script,
                                                  device: this.device });
    if(res) throw new Error('The measurement already exists');                       
});
*/

/*measurementSchema.methods.toCSV = function toCSV() {
    if(!process.env.CSV_DELIMITER ) process.env.CSV_DELIMITER = ','; 
    if(!process.env.CSV_VECTOR_START ) process.env.CSV_VECTOR_START = ''; 
    if(!process.env.CSV_VECTOR_END ) process.env.CSV_VECTOR_END = '';  
    if(!process.env.CSV_VECTOR_DELIMITER ) process.env.CSV_VECTOR_DELIMITER =';' 
    let csv = '';
    this.samples.forEach(sample => {
        sample.values.forEach((value, i) => {
            if (Array.isArray(value)) value = process.env.CSV_VECTOR_START + value.join(process.env.CSV_VECTOR_DELIMITER) + process.env.CSV_VECTOR_END
            if(i!=sample.values.length-1)
                csv += value + process.env.CSV_VECTOR_DELIMITER;
            else
                csv += value;
        });
        csv += '\n';
    });
    return csv;
};*/

module.exports = datauploadSchema;