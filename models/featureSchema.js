const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const ItemTypes = require('../types/itemTypes.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 

const itemSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    unit: { type: String, required: "Please, supply a unit" },
    dimension: { type: Number, default: 0 },
    type: { type: String, enum: ItemTypes, default: ItemTypes.number }, 
    range: [ String ], default:[] },
    { _id: false }  
);

const featureSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
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
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if(!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate tags
featureSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
        for(let i=0; i<values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if(!tag) throw new Error('Feature validation failed: Tag not existent (' + values[i] + ')');
        };
        return true;
    }
});

// validate items
featureSchema.path('items').validate({
    validator: async function (values) { 
        let nameItems=[];    
        for(let i=0; i<values.length; i++) {
            if(nameItems.includes(values[i].name.toLowerCase())){ throw new Error('Feature validation failed: items name duplicated (' + values[i].name.toLowerCase() + ')');}
            nameItems.push(values[i].name.toLowerCase());            
            if( values[i].type == ItemTypes.enum && values[i].range.length == 0 ) { throw new Error('Feature validation failed: enum item without range (' + values[i].name.toLowerCase() + ')'); }
        };
        return true;
    }
});

module.exports = featureSchema;
