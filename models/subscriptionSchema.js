const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
 
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
        const Thing = this.constructor.model('Thing');
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
        const Device = this.constructor.model('Device');
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
        const Tag = this.constructor.model('Tag');
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
        const User = this.constructor.model('User');
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
                                          
    if(res && res._id.toString() != this._id.toString()) throw new Error('The subscription already exists');                       
});

module.exports = subscriptionSchema;
