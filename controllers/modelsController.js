const fs = require('fs');

exports.get = async (req, res) => { 
    const models = {};
    const models_files = await fs.readdirSync('./models/');
    for(let i=0; i<models_files.length; i++) {
        const model = require('../models/' + models_files[i]);
        const model_name = models_files[i].substring(0, 1).toUpperCase() + models_files[i].substring(1, models_files[i].length - 3);
        models[model_name] = model.obj;
    }
    return res.status(200).json(models);    
};

