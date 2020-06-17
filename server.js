const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const errorHandlers = require('./commons/errorHandlers.js');
const swagger = require('swagger-jsdoc');
const info = require('./package.json');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const compression = require('compression');

// https credentials
let cert_file_self = './resources/caCert.pem'; // The self certificate
let key_file_self = './resources/privateKey.pem'; // The self private key
let cert_file_prod = './resources/fullchain.pem'; // The certificate
let key_file_prod = './resources/privkey.pem'; // The private key

// Express server
const app = express();

// compress all responses
app.use(compression());

// Doc engine
const options = {
    swaggerDefinition: {
        info: {
          title: info.name,
          version: info.version,
          description: info.description,
        },
        basePath: '/' + process.env.VERSION + '/',
        tags: [
            { name:"Tenent", description:"An organization" },
            { name:"Thing", description:"A generic object that is the subject of a measurement (e.g. persons, houses, cars, cities, trips, etc.)" },
            { name:"Device", description:"A sensor, real or virtual, which provides measurements about a thing or an actuator that acts on a thing to modify its status (e.g. environmental sensors, physiological parameters monitors, domotic appliances, LEDs, etc.)" },
            { name:"Feature", description:"A physical dimension measured by a device (e.g. heart rate, speed, stat, histogram, etc.)" },
            { name:"Measurement", description:"A value of a feature measured by a device for a specific thing (e.g. the temperature in a car measured by the internal temperature sensor and captured by the car controller.)" },
            { name:"Tag", description:"A label attached to a measurement or to a thing in order to identify it. A Measurement can be described by one or more tags." },
            { name:"Computation", description:"An operation on a group of measurements (e.g. statistical operation: max, min, etc..) " },
            { name:"Constraint", description:"A relathionship between to different resources" }
        ]
      },
    // path to the API docs
    apis: ['./models/*.js', './routes/*.js']
};
const apidoc = swagger(options);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS (cross-domain requests)
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Logger
if(process.env.LOG === 'true') {
    const logger = require('./commons/logger.js');
    app.use(logger);
}

// Serves static files from the public folder. 
// Anything in public/ or api-doc/ foldes will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'api-doc')));
app.get('/' + process.env.VERSION, (req, res, next) => { res.redirect(req.baseUrl + '/'); });

// Provide API version information
const { version } = require('./package.json');
app.get('/' + process.env.VERSION + '/version', (req, res, next) => { return res.status(200).json({ version: version}); });

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}))

// Create HTTP/HTTPS server
let server = null;
let port = process.env.HTTP_PORT;
let message = 'Measurify Cloud API Server is running on HTTP';
if (process.env.PROTOCOL === 'http') {  server = http.createServer(app); }
else {
    try {
        const config = { key: fs.readFileSync(key_file_prod), cert: fs.readFileSync(cert_file_prod), passphrase: process.env.HTTPSSECRET };
        server = https.createServer(config, app);
        port = process.env.HTTPS_PORT;
        message = 'Measurify Cloud API Server is running on HTTPS';
    }
    catch (error) {
        try {
            const config = { key: fs.readFileSync(key_file_self), cert: fs.readFileSync(cert_file_self), passphrase: process.env.HTTPSSECRET };
            server = https.createServer(config, app);
            port = process.env.HTTPS_PORT;
            message = 'WARNING: Measurify Cloud API Server is running on HTTPS with self signed certificate (' + error + ')';
        }
        catch(error) { server = http.createServer(app);
            port = process.env.HTTP_PORT;
            message = 'WARNING: HTTPS not running (' + error + '), Measurify Cloud API Server is running on HTTP';
        }
    }
}

// Attach routes
app.use(require('./routes'));

// Attach Web Socket routes
require('./routes/streamRoute').init(server);

// serve documentation
app.get('/' + process.env.VERSION + '/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(apidoc);
});

// If that above routes didnt work, 
// we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Error handler
app.use(errorHandlers.developmentErrors);

// Run server
server.listen(port, "0.0.0.0", () => { console.log(message + ' - port ' + port) });

module.exports = server;
