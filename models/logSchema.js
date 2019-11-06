const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
 
const logSchema = new mongoose.Schema({ 
    date: { type: Date },
    log: { type: String }    
});

logSchema.plugin(paginate);

if(process.env.LOG !== 'enabled')
    module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);
