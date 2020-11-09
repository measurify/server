const Buncher = require('./buncher');
const runner = require('../computations/runner');
const mongoose = require('mongoose');
const elm = require('../commons/elm');
const fs = require('fs');

const sleep = function(ms){ return new Promise(resolve=>{ setTimeout(resolve, ms) }) };

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

exports.run = async function(computation, user, tenant) { 
    const Feature = mongoose.dbs[tenant._id].model('Feature');
    const feature = await Feature.findById(computation.feature);

    const buncher = new Buncher(computation, user, runner, process.env.COMPUTATION_BUNCH_SIZE, tenant);
    await buncher.init();

    let metadata = {};
    let target = null;
    let model_id = null;

    // Get info about the ELM model from "metadata" field of the measurement
    (computation.metadata).forEach((value, key) => {
        if(key == 'target')
            target = value;
        else{
            try {
                metadata[key] = JSON.parse(value);
            }
            catch{
                metadata[key] = value;
            }
        }
    });

    // Send post request to create elm model
    const post_model = await elm.postModel(metadata).then(function(response){
        if("error" in response){
            runner.error(computation, response['error'], tenant);
            return false;
        }
        model_id = response._id;
        return true;
    }, function(error) {
        runner.error(computation, error, tenant);
        return false;
    });

    if(!post_model) return null;

    // Create ELM file
    const pathfile = process.env.UPLOAD_PATH + '/' + computation._id + '.csv';
    let csvrow = [];
    feature.items.forEach(value => { if(computation.items.includes(value.name)) csvrow.push(value.name) });
    csvrow = csvrow.join(',');

    fs.writeFileSync(pathfile, csvrow, function(error) {
        if(error) return runner.error(computation, error, tenant);
    });

    while(page = await buncher.next()) {
        // Add bunch_size lines to CSV file for ELM
        for(const measurement of page.docs) {
            for(const sample of measurement.samples) {
                let row = [];
                for(i=0; i<sample.values.length; i++) {
                    const item = feature.items[i].name;
                    const value = sample.values[i];
                    if(!computation.items.includes(item)) continue;
                    row.push(value);
                }
                csvrow = '\n';
                csvrow += row.join(',');
                fs.appendFileSync(pathfile, csvrow, function(error) {
                    if(error) return runner.error(computation, error, tenant);
                });
            }
        }
    }

    // Call ELM providing CSV file and model parameters
    const post_dataset = await elm.postDataset(computation, model_id, target).then(function(response){
        const respondeJson = JSON.parse(response);
        if("error" in respondeJson){
            runner.error(computation, respondeJson['error'], tenant);
            return false;
        }
        return true;
    }, function(error) {
        runner.error(computation, error, tenant);
        return false;
    });

    if(!post_dataset) return null;

    // Start training
    const put_training = await elm.putTraining(model_id).then(function(response){
        if("error" in response){
            runner.error(computation, response['error'], tenant);
            return false;
        }
        return true;
    }, function(error){
        runner.error(computation, error, tenant);
        return false;
    });

    if(!put_training) return null;

    // Wait for ELM result
    let go = false;
    let countdown = 20;
    let get_result = false;

    while(!go){
        get_result = await elm.getModel(model_id).then(function(response){
            if("error" in response){
                runner.error(computation, response['error'], tenant);
                return false;
            }
            if(response['status']['code'] === 4){
                go = true;
                return true;
            }
        }, function(error){
            runner.error(computation, error, tenant);
            return false;
        });
        await sleep(500);
        countdown--;
        if(countdown === 0) go = true;
    }

    if(!get_result) return null;
    const result = [];
    runner.complete(computation, result, tenant);
}