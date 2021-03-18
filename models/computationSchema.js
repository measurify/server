const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const ComputationStatusTypes = require('../types/computationStatusTypes.js'); 
const ComputationCodeTypes = require('../types/computationCodeTypes.js'); 
const ItemTypes = require('../types/itemTypes.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

/**
 * @swagger
 * definitions:
 *      computation:
 *          type: object
 *          required:
 *              - code
 *              - filter
 *          properties:
 *              _id: 
 *                  type: string
 *              name:
 *                  description: a human-readable identifier for the computation
 *                  type: string
 *              owner:
 *                  description: the user how creates the computation
 *                  type: 
 *                      $ref: '#/paths/definitions/user'
 *              code:
 *                  description: the function to be executed during the computation
 *                  type: string
 *              filter:
 *                  description: the filter to collect measurement for the computation
 *                  type: string
 *              status:
 *                  description: the status of the computation (running, paused, error, completed)
 *                  type: string
 *              progress:
 *                  description: the percentage of advancement of the computation
 *                  type: number
 *              startDate:
 *                  description: start time for the computation execution
 *                  type: date
 *              endDate:
 *                  description: start time for the computation execution
 *                  type: date
 *              tags: 
 *                  description: list of labels describing the computation
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/tag'
 *         
 */

const computationSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: 'Please, supply the code'  },
    metadata: { type: Map, of: String },
    results: { type: [Map], of: String },
    feature: { type: String, required: 'Please, supply a feature', ref: 'Feature', autopopulate: true },
    items: { type: [String], default: [] },
    filter: { type: String },
    status: { type: String, enum: ComputationStatusTypes, default: ComputationStatusTypes.running },
    progress: {type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    tags: { type: [String], ref: 'Tag' },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false },
    target: { type: String }
});

computationSchema.set('toJSON', { versionKey: false });
computationSchema.index({ name: 1, owner: 1 });
computationSchema.plugin(paginate);
computationSchema.plugin(require('mongoose-autopopulate'));

// validate tags
computationSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
        for (let i = 0; i < values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if (!tag) return false;
        };
        return true;
    },
    message: 'Tag not existent'
});

// validate owner
computationSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate feature
computationSchema.path('feature').validate({
    validator: async function (value) {
        const Feature = this.constructor.model('Feature');
        let feature = await Feature.findById(value);
        if (!feature) return false;
        return true;
    },
    message: 'Feature not existent'
});

// validate items
computationSchema.pre('save', async function() {
    if(!this.items || this.items.length == 0) throw new Error('Computation validation failed: please specify items');  
    const Feature = this.constructor.model('Feature');
    let feature = await Feature.findById(this.feature);
    const item_names = feature.items.map(item => item.name);
    if(!this.items.every(item => item_names.includes(item))) throw new Error('A computation has to work on items contained on the feature');
    for(let item of feature.items) { 
        if(this.items.includes(item.name) && item.type!=ItemTypes.number) throw new Error('A computation needs a numeric item');
        if(this.items.includes(item.name) && item.dimension!=0) throw new Error('A computation is valid just on 1D item');
    } 
});

// validate code
computationSchema.pre('save', async function() {
    if(!this.code) throw new Error('Computation validation failed: please specify the code type');  
    if(!Object.values(ComputationCodeTypes).includes(this.code)) throw new Error('Computation validation failed: unrecognized code');                      
});

// validate id
computationSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Computation validation failed: the _id is already used (' + this._id + ')');
});

module.exports = computationSchema;
