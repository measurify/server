const runner = require('../computations/runner');
const mongoose = require('mongoose');
const elm = require('../commons/elm');


exports.run = async function(computation, user, tenant) {
    const Computation = mongoose.dbs[tenant._id].model('Computation');
    
    const Feature = mongoose.dbs[tenant._id].model('Feature');
    const feature = await Feature.findById(computation.feature);

    let metadata = {};
    let target = computation.target;
    if(!target) target = computation.items[computation.items.length-1]; // default
    let model_id = null;

    // Get info about the ELM model from "metadata" field of the measurement
    (computation.metadata).forEach((value, key) => {
        try{ metadata[key] = JSON.parse(value); }
        catch{ metadata[key] = value; }
    });

    // Added output info
    metadata['output'] = {'is_dataset_test': true, 'dataset_test_size': 0.2}

    // Added webhook
    metadata['webhook'] = {
        url: 'https://localhost:443/v1/computations/' + computation._id,
        method: 'PUT'
    }

    // Send post request to create elm model
    try{
        const { response, body } = await elm.postModel(metadata);
        if(response['statusCode'] != 200){
            runner.error(computation, '[' + body['type'] + '] ' + body['details'], tenant);
            return;
        }
        model_id = body['_id'];
        runner.progress(computation, 25, tenant);
        await Computation.findByIdAndUpdate(computation._id, {$set: {'metadata.model_id': model_id} }, {upsert: true});
    }
    catch{
        runner.error(computation, "ELM not found", tenant);
        return;
    }

    // Create ELM file
    const data = {
        mode: 'measurify',
        feature: computation.feature,
        items: computation.items,
        filter: computation.filter,
        target: computation.target
    }
    try{
        const { response, body } = await elm.putMeasurify(data, model_id);
        if(response['statusCode'] != 200){
            runner.error(computation, '[' + body['type'] + '] ' + body['details'], tenant);
            return;
        }
        runner.progress(computation, 75, tenant);
    }
    catch{
        runner.error(computation, "ELM not found", tenant);
        return;
    }
}

exports.update = async function(computation, user, tenant){
    runner.progress(computation, computation.progress, tenant);
    if(computation.progress===100){
        try{
            const { response, body } = await elm.getModel(computation.metadata.get('model_id'));
            if(response['statusCode'] != 200){
                runner.error(computation, '[' + body['type'] + '] ' + body['details'], tenant);
                return;
            }
            const result = body['result'];
            runner.complete(computation, result, tenant);
        }
        catch{
            runner.error(computation, "ELM not found", tenant);
            return;
        }
    }
}