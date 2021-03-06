const websocket = require('ws');
const url = require('url');
const authentication = require('../security/authentication.js');
const thingController = require('../controllers/thingController.js');
const deviceController = require('../controllers/deviceController.js');

exports.init = function(server) {
    
    const wss = new websocket.Server({server});

    const close = function(ws, message) {
        ws.send(message);
        ws.close();
    }

    wss.on('connection', async function connection(ws, req) {
        req.params = require('url').parse(req.url, true).query;
        if (!req.params.token) { close(ws, 'Websocket disconnected due to missing token'); }
        req.user = await authentication.user(req.params.token);
        if (!req.user) { close(ws, 'Websocket disconnected due to invalid token'); }
        if(req.params.thing) { req.params.id = req.params.thing; await thingController.getstream(ws,req); }
        else if(req.params.device) { req.params.id = req.params.device; await deviceController.getstream(ws,req); }
        else { close(ws, 'Websocket disconnected due to invalid entity'); }
    });
}
