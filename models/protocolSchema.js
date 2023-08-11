const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const MetadataTypes = require('../types/metadataTypes.js');
const TopicFieldTypes = require('../types/topicFieldTypes.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const StageTypes = require("../types/stageTypes.js");

const metadataSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    description: {type: String},
    type: { type: String, enum: MetadataTypes, default: MetadataTypes.scalar },
    range: {type:[ String ], default:[]},
    unit: { type: String}},
    { _id: false }  
);

const fieldSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    description: {type: String},
    type: { type: String, enum: TopicFieldTypes, default: TopicFieldTypes.scalar }, 
    range: {type:[ String ], default:[]} },
    { _id: false }  
);

const topicSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    description: {type: String},
    unit: { type: String},
    fields: [ fieldSchema ], },
    { _id: false } 
);

const protocolSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    description: {type: String},
    metadata: [ metadataSchema ],
    topics: [ topicSchema ],
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    tags: { type: [String], ref:'Tag' },
    visibility: {type: String, default: VisibilityTypes.public },
    stage: { type: String, enum: StageTypes, default: StageTypes.final },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

protocolSchema.set('toJSON', { versionKey: false });
protocolSchema.index({ owner: 1 });
protocolSchema.index({ timestamp: 1 });
protocolSchema.plugin(paginate);
protocolSchema.plugin(require('mongoose-autopopulate'));

// validate owner
protocolSchema.path('owner').validate({
    validator: async function (value) {
        let User = this.User;
        if(!User) User = this.model('User');  
        let user = await User.findById(value);
        if(!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate tags
protocolSchema.path('tags').validate({
    validator: async function (values) {
        Tag = this.model('Tag');        
        for(let i=0; i<values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if(!tag) throw new Error('Protocol validation failed: Tag not existent (' + values[i] + ')');
        };
        return true;
    }
});

// validate metadata
protocolSchema.path('metadata').validate({
    validator: async function (values) { 
        let names=[];    
        for(let i=0; i<values.length; i++) {
            if(names.includes(values[i].name.toLowerCase())){ throw new Error('Protocol validation failed: metadata name duplicated (' + values[i].name.toLowerCase() + ')'); }
            names.push(values[i].name.toLowerCase());       
            if( values[i].type == MetadataTypes.enum && values[i].range.length == 0 ) { throw new Error('Protocol validation failed: enum metadata without range (' + values[i].name.toLowerCase() + ')'); }     
        };
        return true;
    }
});

// validate topic
protocolSchema.path('topics').validate({
    validator: async function (values) { 
        let names=[];    
        for(let i=0; i<values.length; i++) {
            if(names.includes(values[i].name.toLowerCase())){ throw new Error('Protocol validation failed: topic name duplicated (' + values[i].name.toLowerCase() + ')'); }
            names.push(values[i].name.toLowerCase());            
        };
        return true;
    }
});

// validate field
topicSchema.path('fields').validate({
    validator: async function (values) { 
        let names=[];    
        for(let i=0; i<values.length; i++) {
            if(names.includes(values[i].name.toLowerCase())){ throw new Error('Protocol validation failed: field name duplicated (' + values[i].name.toLowerCase() + ')'); }
            names.push(values[i].name.toLowerCase()); 
            if( values[i].type == TopicFieldTypes.enum && values[i].range.length == 0 ) { throw new Error('Protocol validation failed: enum field without range (' + values[i].name.toLowerCase() + ')'); }   
        };
        return true;
    }
});
  
module.exports = protocolSchema;
