const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

const Tag = mongoose.model('Tag');
const User = mongoose.model('User');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

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
const scriptSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: "Please, supply the code" },
    visibility: {type: String, default: VisibilityTypes.private },
    tags: [{ type: String, ref: 'Tag' }],
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
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate id
scriptSchema.pre('save', async function () {
    const res = await this.constructor.findOne({ _id: this._id });
    if (res) throw new Error('Script validation failed: the _id is already used (' + this._id + ')');
});

module.exports = mongoose.models.Script || mongoose.model('Script', scriptSchema);