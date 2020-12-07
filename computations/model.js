const runner = require('../computations/runner');
const mongoose = require('mongoose');
const elm = require('../commons/elm');


exports.run = async function(computation, user, tenant) {
    if(computation['tags'].length != 2) {
        runner.error(computation, 'Computation must be two tags for classification', tenant);
        return;
    }
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

    // Added webhook info
    metadata['webhook'] = {
        url: 'https://localhost:443/v1/hooks/' + computation._id,
        method: 'POST'
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
    catch(err){
        runner.error(computation, err, tenant);
        return;
    }

    // Create ELM file
    const data = {
        mode: 'measurify',
        feature: computation.feature,
        items: computation.items,
        filter: computation.filter,
        tags: computation.tags
    }
    try{
        const { response, body } = await elm.putMeasurify(data, model_id);
        if(response['statusCode'] != 200){
            runner.error(computation, '[' + body['type'] + '] ' + body['details'], tenant);
            return;
        }
        runner.progress(computation, 75, tenant);
    }
    catch(err){
        runner.error(computation, err, tenant);
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
            let results = {};
            for(const [key, value] of Object.entries(body['result'])){
                if(typeof value == 'object')
                    results[key] = JSON.stringify(value);
                else
                    results[key] = value;
            }
            runner.complete(computation, results, tenant);
        }
        catch(err){
            runner.error(computation, err, tenant);
            return;
        }
    }
}