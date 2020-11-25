const request = require('request');

exports.sendJson = async function(url, method, headers, json=true) {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: method,
            headers: headers,
            json: json,
            rejectUnauthorized: false
        }, (error, response, body) => {
            if(error)
                reject(error);
            else
                resolve({response, body});
        });
    });
}

exports.sendForm = async function(url, method, headers, formData) {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: method,
            headers: headers,
            formData: formData,
            rejectUnauthorized: false
        }, (error, response, body) => {
            if(error)   
                reject(error);
            else{
                body = JSON.parse(body);
                resolve({response, body});
            }
        });
    });
}