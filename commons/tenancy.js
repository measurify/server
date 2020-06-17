const mongoose = require('mongoose');
const fs = require('fs');  

const create = async function(id) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    let tenant = await Tenant.findById(id);
    if(!tenant) {
        const req = { 
            _id: id,
            passwordhash: process.env.DEFAULT_TENANT_PASSWORDHASH
        };
        tenant = new Tenant(req);
        await tenant.save();
    }
}

exports.getList = async function() {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');;
    await create(process.env.DEFAULT_TENANT_PROD);
    await create(process.env.DEFAULT_TENANT_TEST);
    return await Tenant.find({});
};

exports.init = async function(tenant) {
    mongoose.dbs[tenant._id] = await mongoose.dbs['catalog'].useDb(tenant._id);
    const models = await fs.readdirSync('./models/');
    for(i=0; i<models.length; i++) {
        if(models[i] == "tenantSchema.js") continue;
        if(models[i] == "logSchema.js") continue;
        const model_schema = require('../models/' + models[i]);
        const model_name = models[i].substring(0, 1).toUpperCase() + models[i].substring(1, models[i].length - 9);
        await mongoose.dbs[tenant._id].model(model_name, model_schema);
    };        
};