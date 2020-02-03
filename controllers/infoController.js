const mongoose = require('mongoose');
const factory = require('../commons/factory.js');
const User = mongoose.model('User');
const Tag = mongoose.model('Tag');
const Feature = mongoose.model('Feature');
const Device = mongoose.model('Device');
const Script = mongoose.model('Script');
const Thing = mongoose.model('Thing');
const Right = mongoose.model('Right');
const Measurement = mongoose.model('Measurement');
const Constraint = mongoose.model('Constraint');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => {
    const { version } = require('../package.json');;
    const environment = process.env.ENV;
    const token_expiration_time = process.env.EXPIRATIONTIME;
    const database = process.env.DATABASE;
    const timestamp = Date.now().toString();
    const info = {version: version, environment: environment, token_expiration_time: token_expiration_time, database: database, timestamp: timestamp };
    res.status(200).json(info);
};
