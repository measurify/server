const mongoose = require('mongoose');
const UserRoles = require('../types/userRoles.js');
const UserStatusTypes = require('../types/userStatusTypes.js');

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, unique: true, select: false },
    email: { type: String, index: true },
    type: { type: String,  required: "Please, supply a user role", ref:'Role' },
    fieldmask: { type: String, ref: 'Fieldmask' },
    status: { type: String, enum: UserStatusTypes, default: UserStatusTypes.enabled },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

//userSchema.set('toJSON', { versionKey: false });

userSchema.plugin(require('mongoose-autopopulate'));
userSchema.plugin(require('mongoose-paginate-v2'));

//check username duplicated
userSchema.pre('save', async function() {
    if(this.isNew){let res = await this.constructor.findOne( { username:this.username});                                             
    if(res) throw new Error('The username '+this.username+' already exists'); }                      
});

// validate type
userSchema.path('type').validate({
    validator: async function (value) {
        const Role = this.constructor.model('Role');
        if(!value) return false;    
        let role = await Role.findById(value);
        if(!role) return false;        
        return true;
    },
    message: 'Role not existent'
});

// check status
userSchema.pre('save', async function() {
    if(this.status) if(!Object.values(UserStatusTypes).includes(this.status)) throw new Error('User validation failed: unrecognized status');                      
});

module.exports = userSchema;
