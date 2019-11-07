const authentication = require('../security/authentication.js');
const morgan = require('mongoose-morgan');

morgan.token('who', function (req, res) { 
    if(req.headers.authorization == null) return "Anonymous";
    return authentication.decode(req.headers.authorization).username; 
});

morgan.token('url', function (req, res) { return decodeURIComponent(req.originalUrl); });

morgan.token('body', function (req, res) { return JSON.stringify(req.body); });

const connection = { connectionString: process.env.DATABASE };

const option = { };

const format = '{request: :method :url, contents: :body, user: :who, result: :status}';

module.exports = morgan(connection, option, format);
