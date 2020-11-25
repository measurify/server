const request = require('../commons/request');

const base_url = process.env.ELM_URL + process.env.ELM_BASE_ROUTE;
const base_headers = {
    'User-Agent': 'Measurify',
    'Connection': 'keep-alive',
    'Authorization': process.env.ELM_TOKEN
}

exports.postModel = async function(data){
    return request.sendJson(base_url, 'POST', base_headers, json=data);
}

exports.putMeasurify = async function(data, elm_id){
    let url = base_url + '/' + elm_id;

    return request.sendJson(url, 'PUT', base_headers, json=data);
}

exports.getModel = async function(elm_id){
    let url = base_url + '/' + elm_id;

    return request.sendJson(url, 'GET', base_headers);
}

exports.getOutput = async function(elm_id){
    let url = base_url + '/' + elm_id + '/output';

    return request.sendJson(url, 'GET', base_headers);
}