const mongoose = require('mongoose');
const UserRoles = require('../types/userRoles.js');
const UserStatusTypes = require('../types/userStatusTypes.js');

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true },
    password: { type: String, required: true, select: false },
    email: { type: String, index: true },
    type: { type: String, enum: UserRoles, required: true },
    groups: { type: [String], ref:'Group' },
    fieldmask: { type: String, ref: 'Fieldmask' },
    status: { type: String, enum: UserStatusTypes, default: UserStatusTypes.enabled },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

//userSchema.set('toJSON', { versionKey: false });

userSchema.plugin(require('mongoose-autopopulate'));
userSchema.plugin(require('mongoose-paginate-v2'));

// validate groups
userSchema.path('groups').validate({
    validator: async function (values) {
        const Group = this.constructor.model('Group');
        for(let i=0; i<values.length; i++) {
            let group = await Group.findById(values[i]);
            if(!group) throw new Error('User validation failed: Group not existent (' + values[i] + ')');
        };
        return true;
    }
});

// check if already exists a similar user (idempotent): same username
userSchema.pre('save', async function() {
    const res = await this.constructor.findOne( { username: this.username });
    if(res) throw new Error('User validation failed: a user with the same username already exists (' + this.username + ')');                       
});

// check if already exists a similar user (idempotent): same email
userSchema.pre('save', async function() {
    if(this.email){
        const res = await this.constructor.findOne( { email: this.email });
        if(res) throw new Error('User validation failed: a user with the same email already exists (' + this.email + ')');   
    }                    
});

// check type
userSchema.pre('save', async function() {
    if(!this.type) throw new Error('User validation failed: please specify the user type');  
    if(!Object.values(UserRoles).includes(this.type)) throw new Error('User validation failed: unrecognized type');                      
});

// check status
userSchema.pre('save', async function() {
    if(this.status) if(!Object.values(UserStatusTypes).includes(this.status)) throw new Error('User validation failed: unrecognized status');                      
});

module.exports = userSchema;
