const EventEmitter = require('events');
const stream = new EventEmitter();

exports.subscribe = function(channel, who) {
    const action = function(data) { who.send(JSON.stringify(data)); }

    who.on('close', function(user) {
        who.close();
        who._socket.destroy();   
        stream.removeListener(channel, action);     
    });
    
    who.on('error', function(error) {
        who.close();
        who._socket.destroy();
        stream.removeListener(channel, action); 
    });

    stream.on(channel, action); 
}

exports.publish = function(channel, what) {
    stream.emit(channel, JSON.stringify(what));
}

