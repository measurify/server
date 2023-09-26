const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const StageTypes = require("../types/stageTypes.js");

const scriptSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: "Please, supply the code" },
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    stage: { type: String, enum: StageTypes, default: StageTypes.final },
    tags: { type: [String], ref: 'Tag' },
    description: { type: String },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

scriptSchema.set('toJSON', { versionKey: false });
scriptSchema.index({ owner: 1 });
scriptSchema.plugin(paginate);
scriptSchema.plugin(require('mongoose-autopopulate'));

// validate tags
scriptSchema.path('tags').validate({
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

// validate owner
scriptSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

module.exports = scriptSchema;