const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
 
const logSchema = new mongoose.Schema({ 
    date: { type: Date, default: Date.now() },
    log: { type: String }    
}/*, { capped: { size: 1000000, max: 10000, autoIndexId: true } }*/);

logSchema.plugin(paginate);

if(process.env.LOG !== 'enabled')
    module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);