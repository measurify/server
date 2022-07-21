const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const VisibilityTypes = require('../types/visibilityTypes.js'); 

const tagSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: true },
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.public },
    tags: { type: [String], ref: 'Tag' },
    timestamp: { type: Date, default: Date.now, select: false },
    description: { type: String },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

tagSchema.set('toJSON', { versionKey: false });
tagSchema.index({ owner: 1 });
tagSchema.plugin(paginate);
tagSchema.plugin(require('mongoose-autopopulate'));

// validate owner
tagSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate tags
tagSchema.path('tags').validate({
    validator: async function (values) {
        for (let i = 0; i < values.length; i++) {
            const tag = await this.constructor.findById(values[i]);
            if (!tag) return false;
        };
        return true;
    },
    message: 'Tag not existent'
});

module.exports = tagSchema;
