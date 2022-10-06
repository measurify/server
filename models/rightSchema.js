const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const RightTypes = require('../types/rightTypes.js');
const ConstraintTypes = require('../types/constraintTypes.js');

const rightSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    type: { type: String, enum: RightTypes, required: "Please, supply the resource type" },
    resource: { type: String, required: "Please, supply a resource" },
    user: { type: [mongoose.Schema.Types.ObjectId], ref:'User', autopopulate: true },
    group: { type: [String], ref:'Group' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    tags: { type: [String], ref: 'Tag' },
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
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
        return true;
    }
});

// validate user
rightSchema.path('user').validate({
    validator: async function (values) {
        const User = this.constructor.model('User');
        for (let i = 0; i < values.length; i++) {
            const user = await User.findById(values[i]);
            if (!user) throw new Error('User not existent (' + values[i] + ')');
        };
        return true;
    }
});

// validate group
rightSchema.path('group').validate({
    validator: async function (values) {
        const Group = this.constructor.model('Group');
        for (let i = 0; i < values.length; i++) {
            const group = await Group.findById(values[i]);
            if (!group) throw new Error('Group not existent (' + values[i] + ')');
        };
        return true;
    }
});

// validate tags
rightSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
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
    try { model = this.constructor.model(this.type) } catch(err) {};
    if(!model) throw new Error('Unrecognized resource type (' + this.type + ')');
    const resource = await model.findById(this.resource);
    if(!resource) throw new Error('Resource not found (' + this.resource + ')');                   
});

// group and user have at least one element
rightSchema.pre('save', async function() {    
    if(this.user.length==0&&this.group.length==0) throw new Error('user and group fields cannot be both empty');                  
});

// check if already have a similar right (idempotent)
rightSchema.pre('save', async function(next, opts, callback) {
    if(opts.update) return;
    const res = await this.constructor.findOne( { type: this.type,
                                                  resource: this.resource,
                                                  user: this.user,
                                                  group: this.group });                                            
    if(res && res._id.toString() != this._id.toString()) throw new Error('The right already exists (' + res._id + ')');                       
});

module.exports = rightSchema;
