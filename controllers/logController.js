const mongoose = require('mongoose');
const manager = require('../commons/manager');
const Log = mongoose.model('Log');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    try {
        const logs = await manager.getResourceList(req.query, '{ "date": "desc" }', '{}', Log);
        return res.status(200).json(logs);
    } 
    catch (err) { return errors.manage(res, errors.generic_request_error, err); } 
};

