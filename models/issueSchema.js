const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const IssueTypes = require('../types/issueTypes.js'); 
const StatusTypes = require('../types/statusTypes.js'); 


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
const issueSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: { type: String, required: "Please, supply a device", ref: 'Device', autopopulate: true, index: true },
    date: {type: Date, default: Date.now },
    message: { type: String },
    type: { type: String, required: "Please, supply an issue type", },
    status: { type: String, default: StatusTypes.open },
    timestamp: {type: Date, default: Date.now, select: false },
});

issueSchema.set('toJSON', { versionKey: false, timestamp: false });
issueSchema.index({ owner: 1 });
issueSchema.plugin(paginate);
issueSchema.plugin(require('mongoose-autopopulate'));

// validate owner
issueSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// check type
issueSchema.pre('save', async function() {
    if(!this.type) throw new Error('Issue validation failed: supply an issue type');  
    if(!Object.values(IssueTypes).includes(this.type)) throw new Error('Issue validation failed: unrecognized issue type');                      
});

// check status
issueSchema.pre('save', async function() {
    if(!this.status) throw new Error('Issue validation failed: supply an issue status');  
    if(!Object.values(StatusTypes).includes(this.status)) throw new Error('Issue validation failed: unrecognized issue status');                      
});

// validate device
issueSchema.path('device').validate({
    validator: async function (value) {
        const Device = this.constructor.model('Device');
        let device = await Device.findById(value);
        if (!device) return false;
        return true;
    },
    message: 'Device not existent'
});

// check if already have a similar issues (idempotent)
// same date, device, type and message
issueSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { device: this.device,
                                                  owner: this.owner._id,
                                                  date: this.date,
                                                  message:  this.message,
                                                  type: this.type });
    if(res) throw new Error('The issue already exists');                       
});

module.exports = issueSchema;