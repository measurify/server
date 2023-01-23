const mongoose = require('mongoose');
const factory = require('../commons/factory.js');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const { passwordStrength } = require('check-password-strength');

exports.get = async (req, res) => {
    const { version } = require('../package.json');
    const database = process.env.DATABASE;
    const demo = process.env.DEMO;
    const log = process.env.LOG;
    const token_expiration_time = process.env.JWT_EXPIRATIONTIME;
    const CSVdelimiter = process.env.CSVDELIMITER;
    const timestamp = Date.now().toString();
    const info = {version: version, demo: demo, token_expiration_time: token_expiration_time, 
                  database: database, timestamp: timestamp, log:log, CSVdelimiter:CSVdelimiter };
    res.status(200).json(info);
};

exports.getPasswordStrength = async (req, res) => {
    const passwordStrength = {passwordStrength:  process.env.MIN_PASSWORD_STRENGTH, ValidityPasswordDays:process.env.DEFAULT_DAYS_VALIDITY_PASSWORD};
    res.status(200).json(passwordStrength);
};