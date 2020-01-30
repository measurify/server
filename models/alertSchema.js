const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const User = mongoose.model('User');
const Device = mongoose.model('Device');
const AlertTypes = require('../types/alertTypes.js'); 

/**
 * @swagger
 * definitions:
 *      script:
 *          type: object
 *          required:
 *              - _id
 *              - owner
 *          properties:
 *              _id: 
 *                  type: string
 *              source: 
 *                  description: a nested document to store the edge code
 *                  type: string 
 *              tags: 
 *                  description: list of labels related to the script
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/script'
 */
const alertSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, autopopulate: true },
    device: { type: String, required: "Please, supply a device", ref: 'Device', autopopulate: true, index: true },
    date: {type: Date, default: Date.now },
    message: { type: String },
    type: { type: String, required: "Please, supply an alert type", },
    timestamp: {type: Date, default: Date.now, select: false },
});

alertSchema.set('toJSON', { versionKey: false, timestamp: false });
alertSchema.index({ owner: 1 });
alertSchema.plugin(paginate);
alertSchema.plugin(require('mongoose-autopopulate'));

// validate owner
alertSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// check type
alertSchema.pre('save', async function() {
    if(!this.type) throw new Error('Alert validation failed: supply an alert type');  
    if(!Object.values(AlertTypes).includes(this.type)) throw new Error('Alert validation failed: unrecognized alert type');                      
});

// validate device
alertSchema.path('device').validate({
    validator: async function (value) {
        let device = await Device.findById(value);
        if (!device) return false;
        return true;
    },
    message: 'Device not existent'
});

// check if already have a similar alert (idempotent)
// same date, device, type and message
alertSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { device: this.device,
                                                  owner: this.owner._id,
                                                  date: this.date,
                                                  message:  this.message,
                                                  type: this.type });
    if(res) throw new Error('The alert already exists');                       
});

module.exports = mongoose.models.Alert || mongoose.model('Alert', alertSchema);