const runner = require('../computations/runner');
const request = require('../commons/request');
const fs = require('fs');

exports.postModel = async function(body){
    const url = process.env.ELM_URL + process.env.ELM_MODEL;
    const headers = {
        'User-Agent': 'Measurify',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Authorization': process.env.ELM_TOKEN
    }
    return request.sendJson(url, 'POST', headers, json=body);
}

exports.postDataset = async function(computation, elm_id, target){
    const url = process.env.ELM_URL + process.env.ELM_MODEL + '/' + elm_id + '/trainingset';
    const headers = {
        'User-Agent': 'Measurify',
        'Content-Type': 'multipart/form-data',
        'Connection': 'keep-alive',
        'Authorization': process.env.ELM_TOKEN
    }
    const items = Array.from(computation.items);
    items.forEach((value, i) => { 
        if(items[i] == target) items.splice(i, 1);
        else items[i] = '"'+value+'"'; 
    });

    const select_columns = items.join(','); 
    const formData = {
        file: fs.createReadStream(process.env.UPLOAD_PATH+'/'+computation._id+'.csv'),
        select_columns: "["+select_columns+"]",
        target_column: '"'+target+'"'
    };
    return request.sendForm(url, 'POST', headers, formData);
}

exports.putTraining = async function(elm_id){
    const url = process.env.ELM_URL + process.env.ELM_MODEL + '/' + elm_id;
    const headers = {
        'User-Agent': 'Measurify',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Authorization': process.env.ELM_TOKEN
    }
    const evaluate = {
        evaluate: true
    };
    return request.sendJson(url, 'PUT', headers, json=evaluate);
}

exports.putPredict = async function(elm_id, samples){
    const url = process.env.ELM_URL + process.env.ELM_MODEL + '/' + elm_id;
    const headers = {
        'User-Agent': 'Measurify',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Authorization': process.env.ELM_TOKEN
    }
    const predict = {
        predict: true,
        samples: samples
    };
    return request.sendJson(url, 'PUT', headers, json=predict);
}

exports.getModel = async function(elm_id){
    const url = process.env.ELM_URL + process.env.ELM_MODEL + '/' + elm_id;
    const headers = {
        'User-Agent': 'Measurify',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Authorization': process.env.ELM_TOKEN
    }
    return request.sendJson(url, 'GET', headers);
}

exports.getOutput = async function(elm_id){
    const url = process.env.ELM_URL + process.env.ELM_MODEL + '/' + elm_id + '/output';
    const headers = {
        'User-Agent': 'Measurify',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Authorization': process.env.ELM_TOKEN
    }
    return request.sendJson(url, 'GET', headers);
}

