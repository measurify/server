const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const AccessTypes = require('../types/accessTypes.js'); 
 
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
const rightSchema = new mongoose.Schema({ 
    resource: { type: String, required: "Please, supply a resource" },
    type: { type: String, required: "Please, supply the resource type" },
    user: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true, autopopulate: true },
    access: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true, autopopulate: true },
    visibility: {type: String, default: VisibilityTypes.private },
    tags: [{ type: String, ref: 'Tag' }],
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

rightSchema.set('toJSON', { versionKey: false });
rightSchema.index({ resource: 1 });
rightSchema.plugin(paginate);
rightSchema.plugin(require('mongoose-autopopulate'));

// validate owner
rightSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
        return true;
    }
});

// validate user
rightSchema.path('user').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
        return true;
    }
});

// validate access type
rightSchema.path('access').validate({
    validator: async function (values) {
        for (let i = 0; i < values.length; i++) {
            if(!Object.values(AccessTypes).includes(value)) throw new Error('Unrecognized access type (' + value + ')');
        };
        return true;
    }
});

// validate tags
rightSchema.path('tags').validate({
    validator: async function (values) {
        for (let i = 0; i < values.length; i++) {
            const tag = await Tag.findById(values[i]);
            if (!tag) return false;
        };
        return true;
    },
    message: 'Tag not existent'
});

// validate resource
rightSchema.pre('save', async function() {
    let model = null;
    try { model = mongoose.model(this.type) } catch(err) {};
    if(!model) throw new Error('Unrecognized resource type (' + this.type + ')');
    const resource = await model.findById(this.resource);
    if(!resource) throw new Error('Resource not found (' + this.resource + ')');                   
});

// check if already have a similar right (idempotent)
rightSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { type: this.type,
                                                  resource: this.resource,
                                                  user: this.user });
    if(res) throw new Error('The right already exists (' + res._id + ')');                       
});

module.exports = mongoose.models.Right || mongoose.model('Right', rightSchema);
