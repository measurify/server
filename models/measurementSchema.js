const mongoose = require('mongoose');
const geojson = require('mongoose-geojson-schema');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

const Feature = mongoose.model('Feature');
const Tag = mongoose.model('Tag');
const Device = mongoose.model('Device');
const Thing = mongoose.model('Thing');
const User = mongoose.model('User');
const Script = mongoose.model('Script');
const inspector = require('../commons/inspector.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

/**
* @swagger
* definitions:
*      value:
*          type: object
*          required:
*              - value
*              - date
*          properties:
*              value:
*                  description: vector of values
*                  type: array
*                  items: 
*                      type: number or array    
*              delta:
*                  description: delta time of that value (relative to the measurement start date)
*                  type: number
*/
const sampleSchema = new mongoose.Schema({
    values: { type: [[Object]], default: [] },
    delta: { type: Number } },
    { _id: false }
);


/**
 * @swagger
 * definitions:
 *      measurement:
 *          type: object
 *          required:
 *              - thing
 *              - device
 *              - feature
 *              - values
 *          properties:
 *              location:
 *                  description: the geografical location where the measurament was taken (expressed usgin GeoJSON standard) 
 *                  type: mongoose.SchemaTypes.GeoJSON
 *              startDate:
 *                  description: start time for the measurement activities   
 *                  type: date
 *              endDate:
 *                  description: end time for the measurement activities (if the measurement is instantaneous can be equal to start date)  
 *                  type: date
 *              thing: 
 *                  description: reference to the thing subject of the measurement
 *                  type: string 
 *              device: 
 *                  description: reference to the device used to take the measurement
 *                  type: string
 *              feature: 
 *                  description: reference to the high-order feature of the measurement
 *                  type: string
 *              values: 
 *                  description: list of values related to the measurement
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/value'
 *              tags: 
 *                  description: list of labels related to the measurement
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/tag' 
 *      measurements:
 *          type: object
 *          properties:
 *              docs: 
 *                  description: array of measurements
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/measurement' 
 *              total:
 *                  description: total number of measurements that match a query 
 *                  type: number
 *              limit: 
 *                  description: page size
 *                  type: number
 *              page: 
 *                  description: page number (1 to n)
 *                  type: number 
 *              pages: 
 *                  description: total number of pages
 *                  type: number
 */
const measurementSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, autopopulate: true },
    location: { type: mongoose.SchemaTypes.GeoJSON, required: false, index: "2dsphere" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    thing: { type: String, required: "Please, supply a thing", ref: 'Thing', index: true },
    device: { type: String, required: "Please, supply a device", ref: 'Device', index: true },
    feature: { type: String, required: "Please, supply a feature", ref: 'Feature', index: true },
    script: { type: String, ref: 'Script', index: true },
    samples: [sampleSchema],
    visibility: {type: String, default: VisibilityTypes.private },
    tags: [{ type: String, ref: 'Tag' }],
    timestamp: { type: Date, default: Date.now },
    lastmod: { type: Date, default: Date.now, select: false }
});

measurementSchema.set('toJSON', { versionKey: false });
measurementSchema.index({ owner: 1 });
measurementSchema.plugin(paginate);
measurementSchema.plugin(require('mongoose-autopopulate'));

// validate feature
measurementSchema.path('feature').validate({
    validator: async function (value) {
        const feature = await Feature.findById(value);
        if (!feature) throw new Error('Feature not existent (' + value + ')');
        return true;
    }
});

// validate script
measurementSchema.path('script').validate({
    validator: async function (value) {
        const script = await Script.findById(value);
        if (!script) throw new Error('Script not existent (' + value + ')');
        return true;
    }
});

// validate thing
measurementSchema.path('thing').validate({
    validator: async function (value) {
        const thing = await Thing.findById(value);
        if (!thing) throw new Error('Thing not existent (' + value + ')');
        return true;
    }
});

// validate device
measurementSchema.path('device').validate({
    validator: async function (value) {
        const device = await Device.findById(value);
        if (!device) throw new Error('Device not existent (' + value + ')');
        return true;
    }
});

// validate tags
measurementSchema.path('tags').validate({
    validator: async function (values) {
        for (let value of values) {
            const tag = await Tag.findById(value);
            if (!tag) throw new Error('Tag not existent (' + value + ')');
        };
        return true;
    }
});

// validate owner
measurementSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
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
    const feature = (await Feature.findById(this.feature));
    let result = inspector.areCoherent(this, feature);
    if(result != true) throw new Error(result);
});

// check consistency between device and feature
measurementSchema.pre('save', async function () {
    const feature = await Feature.findById(this.feature);
    const device = await Device.findById(this.device);
    if(!device.features.includes(feature._id)) throw new Error("No match between device features and measurement feature (" + feature._id + ")");
});

// check if already have a similar measurement (idempotent)
// same start/end date, thing, device and feature
measurementSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { feature: this.feature,
                                                  startDate: this.startDate,
                                                  endDate: this.endDate,
                                                  thing:  this.thing,
                                                  device: this.device });
    if(res) throw new Error('The measurement already exists');                       
});

module.exports = mongoose.models.Measurement || mongoose.model('Measurement', measurementSchema);
