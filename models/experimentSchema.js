const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const geojson = require("mongoose-geojson-schema");
const ExperimentStateTypes = require('../types/experimentStateTypes.js');
const VisibilityTypes = require('../types/visibilityTypes.js'); 
const inspector = require("../commons/inspector.js");

const fieldSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a name" },
    value: {type: [Object]} },
    { _id: false }  
);

const historySchema = new mongoose.Schema({ 
    step: { type: Number, required: "Please, supply a numeric step value" },
    timestamp: { type: Date, default: Date.now },
    fields: [ fieldSchema ] },
    { _id: false }  
);

const placeSchema = new mongoose.Schema({ 
    name: { type: String, required: "Please, supply a location name" },
    location: { type: mongoose.SchemaTypes.GeoJSON, required: false, index: "2dsphere"}},
    {_id: false }  
);

const experimentSchema = new mongoose.Schema({ 
    _id: { type: String, required: "Please, supply an _id" },
    description: { type: String },
    state: { type: String, enum: ExperimentStateTypes, default: ExperimentStateTypes.ongoing },
    startDate: { type: Date },
    endDate: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    place: [placeSchema],
    manager:{ type: String },
    protocol: { type: String, required: "Please, supply a protocol", ref: "Protocol", index: true },
    metadata: [ fieldSchema ],
    history: [ historySchema ], 
    tags: { type: [String], ref:'Tag' },
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

experimentSchema.set('toJSON', { versionKey: false });
experimentSchema.index({ owner: 1 });
experimentSchema.index({ timestamp: 1 });
experimentSchema.plugin(paginate);
experimentSchema.plugin(require('mongoose-autopopulate'));

// validate owner
experimentSchema.path('owner').validate({
    validator: async function (value) {
        let User = this.User;
        if(!User) User = this.model('User');  
        let user = await User.findById(value);
        if(!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate protocol
experimentSchema.path("protocol").validate({
    validator: async function (value) {
        let Protocol = this.Protocol;
        if(!Protocol) Protocol = this.model('Protocol');  
        let protocol = await Protocol.findById(value);
        if(!protocol) return false;
        return true;
    },
    message: 'Protocol not existent'
});

// validate tags
experimentSchema.path('tags').validate({
    validator: async function (values) {
        Tag = this.model('Tag');        
        for(let i=0; i<values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if(!tag) throw new Error('Experiment validation failed: Tag not existent (' + values[i] + ')');
        };
        return true;
    }
});

// validate metadata names
experimentSchema.path('metadata').validate({
    validator: async function (values) { 
        let nameItems=[];    
        for(let i=0; i<values.length; i++) {
            if(nameItems.includes(values[i].name.toLowerCase())){
                throw new Error('Experiment validation failed: metadata name duplicated (' + values[i].name.toLowerCase() + ')');
            }
            nameItems.push(values[i].name.toLowerCase());            
        };
        return true;
    }
});

// validate history step
experimentSchema.path('history').validate({
    validator: async function (values) { 
        let steps=[];    
        for(let i=0; i<values.length; i++) {
            if(steps.includes(values[i].step)){
                throw new Error('Experiment validation failed: history step duplicated (' + values[i].step + ')');
            }
            steps.push(values[i].step);            
        };
        return true;
    }
});

// validate history field names
experimentSchema.path('history').validate({
    validator: async function (values) { 
        for(let i=0; i<values.length; i++) {
            let nameItems = [];    
            for(let j=0; j<values[i].fields.length; j++) {
                if(nameItems.includes(values[i].fields[j].name.toLowerCase())){
                    throw new Error('Experiment validation failed: history field name duplicated (' + values[i].step + ' - ' + values[i].fields[j].name.toLowerCase() + ')');
                }
                nameItems.push(values[i].fields[j].name.toLowerCase());            
            }
        }
        return true;
    }
});

// check metatada
experimentSchema.pre("save", async function () {
    let Protocol = this.Protocol;
    if(!Protocol) Protocol = this.model('Protocol');  
    let protocol = await Protocol.findById(this.protocol);
    if(!protocol) throw new Error('Protocol ' + this.protocol + ' not found');
    for (let metadata_element of this.metadata) {
        let result = inspector.checkMetadata(metadata_element, protocol);
        if (result != true) throw new Error(result);
    }
    return true;
});

// check history
experimentSchema.pre("save", async function () {
    let Protocol = this.Protocol;
    if(!Protocol) Protocol = this.model('Protocol');  
    let protocol = await Protocol.findById(this.protocol);
    if(!protocol) throw new Error('Protocol ' + this.protocol + ' not found');
    for (let history_element of this.history) {
        let result = inspector.checkHistory(history_element, protocol);
        if (result != true) throw new Error(result);
    }
    return true;
});
  
module.exports = experimentSchema;
