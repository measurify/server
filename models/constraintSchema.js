const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

const User = mongoose.model('User');
const Feature = mongoose.model('Feature');
const Tag = mongoose.model('Tag');
const Device = mongoose.model('Device');
const Thing = mongoose.model('Thing');
const RelationshipTypes = require('../types/relationshipTypes.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
 
/**
 * @swagger
 * definitions:
 *      constraint:
 *          type: object
 *          properties:
 *              type1: 
 *                  description: a resource type for element1
 *                  type: string
 *              type2: 
 *                  description: a resource type for element2
 *                  type: string
 *              element1: 
 *                  description: id of a record in a resource
 *                  type: string
 *              element2: 
 *                  description: id of a record in a resource
 *                  type: string
 *              relationship: 
 *                  description: type of constraint
 *                  type: string
 *       
 */
const constraintSchema = new mongoose.Schema({ 
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    type1: { type: String, required: "Please, supply type1" },
    type2: { type: String, required: "Please, supply type2"  },
    element1: { type: String, required: "Please, supply element1"  },
    element2: { type: String, required: "Please, supply element2"  },
    relationship: { type: String, required: "Please, supply a relationship"  },
    visibility: {type: String, default: VisibilityTypes.public },
    tags: [{ type: String, ref: 'Tag' }],
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

constraintSchema.set('toJSON', { versionKey: false });
constraintSchema.index({ owner: 1 });
constraintSchema.plugin(paginate);
constraintSchema.plugin(require('mongoose-autopopulate'));

// validate owner
constraintSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
        return true;
    }
});

// validate tags
constraintSchema.path('tags').validate({
    validator: async function (values) {
        for (let i = 0; i < values.length; i++) {
            const tag = await Tag.findById(values[i]);
            if (!tag) return false;
        };
        return true;
    },
    message: 'Tag not existent'
});

// validate relationship
constraintSchema.path('relationship').validate({
    validator: async function (value) {
        if(!Object.values(RelationshipTypes).includes(value)) throw new Error('Unrecognized relationship type (' + value + ')');
        return true;
    }
});

// validate element 1
constraintSchema.pre('save', async function() {
    let model = null;
    try { model = mongoose.model(this.type1) } catch(err) {};
    if(!model) throw new Error('Unrecognized resource type (' + this.type1 + ')');
    const resource = await model.findById(this.element1);
    if(!resource) throw new Error('Element 1 not found (' + this.element1 + ')');                   
});

// validate element 2
constraintSchema.pre('save', async function() {
    let model = null;
    try { model = mongoose.model(this.type2) } catch(err) {};
    if(!model) throw new Error('Unrecognized resource type (' + this.type2 + ')');
    const resource = await model.findById(this.element2);
    if(!resource) throw new Error('Element 2 not found (' + this.element2 + ')');                   
});

// check if already have a similar constraint (idempotent)
constraintSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { type1: this.type1,
                                                  type2: this.type2,
                                                  element1: this.element1,
                                                  element2:  this.element2,
                                                  relationship: this.relationship });
    if(res) throw new Error('The constraint already exists (' + res._id + ')');                       
});

module.exports = mongoose.models.Constraint || mongoose.model('Constraint', constraintSchema);
