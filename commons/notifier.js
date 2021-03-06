const firebase = require("firebase-admin");
const account = require("../security/firebase-config.json");

try{
    firebase.initializeApp({
        credential: firebase.credential.cert(account),
        databaseURL: process.env.FIREBASE_URL
    });
}
catch(error) {
    console.log("Warning: firebase not started, check your firebase-config.json file");
}

const options = { priority: 'high', timeToLive: 60 * 60 * 24 };

exports.send = async function(token, title, body) {
    if(process.env.ENV === 'test') {
        return { results: [ { messageId: 'test-test-test' } ],
                 canonicalRegistrationTokenCount: 0,
                 failureCount: 0,
                 successCount: 1,
                 multicastId: 7504248744698765000
                }
    }
    const payload = { notification: { title: title, body: body } };
    const res = await firebase.messaging().sendToDevice(token, payload, options);
    
    return res;
}
   
