const Buncher = require('./buncher');
const runner = require('../computations/runner');
const mongoose = require('mongoose');
const elm = require('../commons/elm');
const fs = require('fs');
const ComputationStatusTypes = require('../types/computationStatusTypes');

const sleep = function(ms){ return new Promise(resolve=>{ setTimeout(resolve, ms) }) };

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

exports.run = async function(computation, user, tenant) { 
    const Feature = mongoose.dbs[tenant._id].model('Feature');
    const feature = await Feature.findById(computation.feature);

    const buncher = new Buncher(computation, user, runner, process.env.COMPUTATION_BUNCH_SIZE, tenant);
    await buncher.init();

    let metadata = {};
    let target = computation.target;
    if(!target)
        target = computation.items[computation.items.length-1]; // default
    let model_id = null;

    // Get info about the ELM model from "metadata" field of the measurement
    (computation.metadata).forEach((value, key) => {
        try {
            metadata[key] = JSON.parse(value);
        }
        catch{
            metadata[key] = value;
        }
    });

    // Send post request to create elm model
    try{
        const {response, body } = await elm.postModel(metadata);
        if(response['statusCode'] != 200){
            runner.error(computation, '[' + body['type'] + ']' + body['details'], tenant);
            return;
        }
        model_id = body['_id'];
    }
    catch{
        runner.error(computation, 'Error1!', tenant);
        return;
    }

    // Create ELM file
    // option 1 
    try{
        const { response, body } = await elm.postMeasurify(computation, model_id);
        if(response['statusCode'] != 200){
            runner.error(computation, '[' + body['type'] + ']' + body['details'], tenant);
            return;
        }
    }
    catch{
        runner.error(computation, 'Error2!', tenant);
        return;
    }

    // option 2
    // const pathfile = process.env.UPLOAD_PATH + '/' + computation._id + '.csv';
    // let csvrow = [];
    // feature.items.forEach(value => { if(computation.items.includes(value.name)) csvrow.push(value.name) });
    // csvrow = csvrow.join(',');

    // fs.writeFileSync(pathfile, csvrow, function(error) {
    //     if(error) return runner.error(computation, error, tenant);
    // });

    // while(page = await buncher.next()) {
    //     // Add bunch_size lines to CSV file for ELM
    //     for(const measurement of page.docs) {
    //         for(const sample of measurement.samples) {
    //             let row = [];
    //             for(i=0; i<sample.values.length; i++) {
    //                 const item = feature.items[i].name;
    //                 const value = sample.values[i];
    //                 if(computation.items.includes(item)) row.push(value);
    //             }
    //             csvrow = '\n';
    //             csvrow += row.join(',');
    //             fs.appendFileSync(pathfile, csvrow, function(error) {
    //                 if(error) return runner.error(computation, error, tenant);
    //             });
    //         }
    //     }
    // }

    // // Call ELM providing CSV file and model parameters
    // try{
    //     const { response, body } = await elm.postDataset(computation, model_id, target);
    //     if(response['statusCode'] != 200){
    //         runner.error(computation, '[' + body['type'] + ']' + body['details'], tenant);
    //         return;
    //     }
    // }
    // catch{
    //     runner.error(computation, 'ELM Dataset not uploaded!', tenant);
    //     return;
    // }

    // // Start training
    // try{
    //     const { response, body } = await elm.putTraining(model_id);
    //     if(response['statusCode'] != 200){
    //         runner.error(computation, '[' + body['type'] + ']' + body['details'], tenant);
    //         return;
    //     }
    // }
    // catch{
    //     runner.error(computation, 'ELM training failed!', tenant);
    //     return;
    // }


    // // Wait for ELM result
    // let go = false;
    // let countdown = 20;

    // while(!go){
    //     await sleep(500);
    //     try{
    //         const { response, body } = await elm.getModel(model_id);
    //         if(response['statusCode'] != 200){
    //             runner.error(computation, '[' + body['type'] + ']' + body['details'], tenant);
    //             return;
    //         }
    //         if(body['status']['code'] === 4){
    //             go = true;
    //             continue;
    //         }
    //     }
    //     catch{
    //         runner.error(computation, 'Error', tenant);
    //         return;
    //     }
    //     if(countdown-- === 0){
    //         go = true;
    //         runner.error(computation, 'Error', tenant);
    //     }
    // }

    const result = [];
    runner.complete(computation, result, tenant);
}