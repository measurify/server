const firebase = require("firebase-admin");

try{
    const account = require("../security/firebaseConfig.json");
    firebase.initializeApp({
        credential: firebase.credential.cert(account),
        databaseURL: process.env.FIREBASE_URL
    });
    console.log("Firebase initialized!");
}
catch(error) {
    console.log("Warning: Firebase not started, check your firebase-config.json file + (" + error + ")");
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
    const payload = { notification : { title: "Avviso qualità dell'aria", body: "Nuovi dati disponibili. Clicca per visualizzarli" } , data: { "body": body} };
    //const payload = { notification: { title: title, body: body } };
    const res = await firebase.messaging().sendToDevice(token, payload, options);
    
    return res;
}
   
