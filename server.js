const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const errorHandlers = require('./commons/errorHandlers.js');
const info = require('./package.json');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const compression = require('compression');
const tls = require('node:tls');

// https credentials
let cert_file_self = './resources/caCert.pem'; // The self certificate
let key_file_self = './resources/privateKey.pem'; // The self private key
let cert_file_prod = './resources/fullchain.pem'; // The certificate
let key_file_prod = './resources/privkey.pem'; // The private key

// Express server
const app = express();

// compress all responses
app.use(compression());

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS (cross-domain requests)
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Logger
if (process.env.LOG === 'true') {
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
const { error } = require('console');
app.get('/' + process.env.VERSION + '/version', (req, res, next) => { return res.status(200).json({ version: version }); });

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }))

// Create HTTP/HTTPS server
let server = null;
let port = process.env.HTTP_PORT;
let message = 'Measurify Cloud API Server is running on HTTP';
if (process.env.PROTOCOL === 'http') { server = http.createServer(app); }
else {
    try {
        //function to pick out the key + certs dynamically based on the domain name
        function createSecureContext() {
            var secureContext = {}
            fs.readdirSync('./resources/').forEach(el => {
                if (!el.endsWith(".pem") && fs.existsSync('./resources/' + el + '/privkey.pem') && fs.existsSync('./resources/' + el + '/fullchain.pem')) {
                    secureContext[el] = tls.createSecureContext({
                        key: fs.readFileSync('./resources/' + el + '/privkey.pem'),
                        cert: fs.readFileSync('./resources/' + el + '/fullchain.pem'),
                        passphrase: process.env.HTTPSSECRET
                    })
                }
            })
            return secureContext;
        }

        const secureContext = createSecureContext()
        let config;
        if (Object.keys(secureContext).length === 0) {
            console.log("No valid keys in subfolders");

            //controlla le chiavi interne 
            if (fs.existsSync(key_file_prod) && fs.existsSync(cert_file_prod)) {
                config = { key: fs.readFileSync(key_file_prod), cert: fs.readFileSync(cert_file_prod), passphrase: process.env.HTTPSSECRET };
            }
            else {
                //altrimenti throw error per andare al self signed
                throw new error("No keys, self signed server");
            }
        }
        else {
            config = {
                SNICallback: function (domain, cb) {
                    console.log("Called SNICallback")
                    if (secureContext[domain]) {
                        console.log("Certified Domain: " + domain);
                        cb(null, secureContext[domain]);

                    } else {
                        if (fs.existsSync(key_file_prod) && fs.existsSync(cert_file_prod)) {
                            console.log("Unrecognized domain, show default Cert - " + domain);
                            const keysDefault = tls.createSecureContext({
                                key: fs.readFileSync(key_file_prod),
                                cert: fs.readFileSync(cert_file_prod),
                                passphrase: process.env.HTTPSSECRET
                            })
                            cb(null, keysDefault);
                        }
                        else {
                            console.log("Uncertified domain, provide Self-Signed Cert - " + domain);
                            const keysSelf = tls.createSecureContext({
                                key: fs.readFileSync(key_file_self),
                                cert: fs.readFileSync(cert_file_self),
                                passphrase: process.env.HTTPSSECRET
                            })
                            cb(null, keysSelf);
                        }
                    }
                }
            }
        }

        //provide a SNICallback when you create the options for the https server

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
        catch (error) {
            server = http.createServer(app);
            port = process.env.HTTP_PORT;
            message = 'WARNING: HTTPS not running (' + error + '), Measurify Cloud API Server is running on HTTP';
        }
    }
}

// Attach routes
app.use(require('./routes'));

// Attach Web Socket routes
require('./routes/streamRoute').init(server);

// If that above routes didnt work, 
// we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Error handler
app.use(errorHandlers.developmentErrors);

// Run server
server.listen(port, "0.0.0.0", () => { console.log(message + ' - port ' + port) });

module.exports = server;
