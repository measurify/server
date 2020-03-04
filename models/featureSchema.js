const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const ItemTypes = require('../types/itemTypes.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

/**
 * @swagger
 * definitions:
 *      dimension:
 *          type: object
 *          required:
 *              - name
 *              - unit
 *          properties:
 *              name:
 *                  type: string
 *                  description: the name of the dimension
 *              unit:
 *                  type: string
 *                  description: the unit of the dimension
 */
const itemSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    unit: { type: String, required: "Please, supply a unit" },
    dimension: { type: Number, default: 0 },
    type: { type: String, default: ItemTypes.number }, },
    { _id: false }  
);

/**
 * @swagger
 * definitions:
 *      feature:
 *          type: object
 *          required:
 *              - _id
 *              - owner
 *          properties:
 *              _id: 
 *                  type: string
 *              dimensions: 
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/dimension'
 *              owner:
 *                  description: the user how creates the feature
 *                  type: 
 *                      $ref: '#/paths/definitions/tag' 
 *              description:
 *                  description: 
 *                  type: string
 *              order:
 *                  description: 
 *                  type: number
 *              tags: 
 *                  description: list of labels related to the device
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/tag'
 */

const featureSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true, autopopulate: true },
    items: [ itemSchema ],
    timestamp: {type: Date, default: Date.now, select: false },
    tags: { type: [String], ref:'Tag' },
    description: {type: String},
    visibility: {type: String, default: VisibilityTypes.public },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

featureSchema.set('toJSON', { versionKey: false });
featureSchema.index({ owner: 1 });
featureSchema.index({ timestamp: 1 });
featureSchema.plugin(paginate);
featureSchema.plugin(require('mongoose-autopopulate'));

// validate owner
featureSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if(!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate tags
featureSchema.path('tags').validate({
    validator: async function (values) {
        for(let i=0; i<values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if(!tag) throw new Error('Feature validation failed: Tag not existent (' + values[i] + ')');
        };
        return true;
    }
});

// validate id
featureSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Feature validation failed: the _id is already used (' + this._id + ')');
});

module.exports = mongoose.models.Feature || mongoose.model('Feature', featureSchema);
