const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

const Tag = mongoose.model('Tag');
const User = mongoose.model('User');
const Device = mongoose.model('Device');
const Thing = mongoose.model('Thing');
 
/**
 * @swagger
 * definitions:
 *      subscription:
 *          type: object
 *          required:
 *              - _id
 *              - features
 *              - owner
 *          properties:
 *              _id: 
 *                  type: string
 *              features: 
 *                  description: list of features sensed by the device
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/feature'
 *              owner:
 *                  description: the user how creates the device
 *                  type: 
 *                      $ref: '#/paths/definitions/tag'
 *              tags: 
 *                  description: list of labels related to the device
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/tag'
 */
const subscriptionSchema = new mongoose.Schema({ 
    token: { type: String, required: "Please, supply your Firebase push notification token" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    thing: { type: String, ref: 'Thing', index: true },
    device: { type: String, ref: 'Device', index: true },
    tags: { type: [String], ref:'Tag' },
});

subscriptionSchema.set('toJSON', { versionKey: false });
subscriptionSchema.index({ owner: 1 });
subscriptionSchema.index({ thing: 1 });
subscriptionSchema.index({ device: 1 });
subscriptionSchema.plugin(paginate);
subscriptionSchema.plugin(require('mongoose-autopopulate'));

// validate thing
subscriptionSchema.path('thing').validate({
    validator: async function (value) {
        if(value) {
            const thing = await Thing.findById(value);
            if (!thing) throw new Error('Thing not existent (' + value + ')');
        }
        return true;
    }
});

// validate device
subscriptionSchema.path('device').validate({
    validator: async function (value) {
        if(value) {
            const device = await Device.findById(value);
            if (!device) throw new Error('Device not existent (' + value + ')');
        }
        return true;
    }
});

// validate tags
subscriptionSchema.path('tags').validate({
    validator: async function (values) {
        for (let value of values) {
            const tag = await Tag.findById(value);
            if (!tag) throw new Error('Tag not existent (' + value + ')');
        }
        return true;
    }
});

// validate owner
subscriptionSchema.path('owner').validate({
    validator: async function (value) {
        let user = await User.findById(value);
        if (!user) throw new Error('User not existent (' + value + ')');
        return true;
    }
});

// validate device or thing
subscriptionSchema.pre('save', async function () {
    if(!this.device && !this.thing) throw new Error('Subscription validation failed: you have to provide a device or a thing');
});

// check if already have a similar subscription (idempotent)
// same token/device/thing
subscriptionSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { token: this.token,
                                                  device: this.device,
                                                  thing: this.thing});
    if(res) throw new Error('The subscription already exists');                       
});

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
