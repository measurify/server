const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const VisibilityTypes = require('../types/visibilityTypes.js'); 

const groupSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },    
    tags: { type: [String], ref:'Tag' },
    users: { type: [String], ref:'User' },
    description: {type: String},
    visibility: {type: String, default: VisibilityTypes.public },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

groupSchema.set('toJSON', { versionKey: false });
groupSchema.index({ owner: 1 });
groupSchema.plugin(require('mongoose-autopopulate'));
groupSchema.plugin(paginate);

// validate owner
groupSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if(!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate tags
groupSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
        for(let i=0; i<values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if(!tag) throw new Error('Group validation failed: Tag not existent (' + values[i] + ')');
        };
        return true;
    }
});

// validate users
groupSchema.path('users').validate({
    validator: async function (values) {
        const User = this.constructor.model('User');
        for(let i=0; i<values.length; i++) {
            let user = await User.findById(values[i]);
            if(!user) throw new Error('Group validation failed: User not existent (' + values[i] + ')');
        };
        return true;
    }
});

module.exports = groupSchema;
