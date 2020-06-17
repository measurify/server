const EventEmitter = require('events');
const stream = new EventEmitter();
const notifier = require('./notifier.js');
const mongoose = require('mongoose');

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

exports.publish = function(channel, title, what) {
    stream.emit(channel, JSON.stringify(what));
}

exports.notify = async function(what, tenant) {
    if(!tenant) return; 
    const Subscription = mongoose.dbs[tenant._id].model('Subscription');
    const subscribers = await Subscription.find({$or:[{'device': what.device}, {'thing': what.thing}]});
    for (let subscriber of subscribers) {      
        const title = what.device || what.thing;
        const res = await notifier.send(subscriber.token, title, JSON.stringify(what)); 
    }; 
}
