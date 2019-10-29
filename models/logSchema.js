const mongoose = require('mongoose');
 
const logSchema = new mongoose.Schema({ 
    date: { type: Date },
    log: { type: String }    
});

logSchema.plugin(require('mongoose-paginate-v2'));

if(process.env.LOG !== 'enabled')
    module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);
