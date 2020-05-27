const express = require('express');
const router = express.Router();
const passport = require('passport');

// login
const loginRoute = require('./routes/loginRoute');
router.use('/' + process.env.VERSION + '/login', loginRoute);

// demo
if (process.env.DEMO === 'true') {
    const demoRoute = require('./routes/demoRoute');
    router.use('/' + process.env.VERSION + '/demo', passport.authenticate('jwt', {session: false}), demoRoute);
}

// log
const logRoute = require('./routes/logRoute');
router.use('/' + process.env.VERSION + '/log', passport.authenticate('jwt', {session: false}), logRoute);

// errors
const errorRoute = require('./routes/errorRoute');
router.use('/' + process.env.VERSION + '/errors', errorRoute);

// user
const userRoute = require('./routes/userRoute');
router.use('/' + process.env.VERSION + '/users', passport.authenticate('jwt', {session: false}), userRoute);
const usernameRoute = require('./routes/usernameRoute');
router.use('/' + process.env.VERSION + '/usernames', passport.authenticate('jwt', {session: false}), usernameRoute);
const selfRoute = require('./routes/selfRoute');
router.use('/' + process.env.VERSION + '/self', selfRoute);

// measurement
const measurementsRoute = require('./routes/measurementRoute');
router.use('/' + process.env.VERSION + '/measurements', passport.authenticate('jwt', {session: false}), measurementsRoute);

// tag
const tagsRoute = require('./routes/tagRoute');
router.use('/' + process.env.VERSION + '/tags', passport.authenticate('jwt', {session: false}), tagsRoute);

// Issue
const issuesRoute = require('./routes/issueRoute');
router.use('/' + process.env.VERSION + '/issues', passport.authenticate('jwt', {session: false}), issuesRoute);

// device
const devicesRoute = require('./routes/deviceRoute');
router.use('/' + process.env.VERSION + '/devices', passport.authenticate('jwt', {session: false}), devicesRoute);

// script
const scriptsRoute = require('./routes/scriptRoute');
router.use('/' + process.env.VERSION + '/scripts', passport.authenticate('jwt', {session: false}), scriptsRoute);

// right
const rightsRoute = require('./routes/rightRoute');
router.use('/' + process.env.VERSION + '/rights', passport.authenticate('jwt', {session: false}), rightsRoute);

// subscription
const subscriptionsRoute = require('./routes/subscriptionRoute');
router.use('/' + process.env.VERSION + '/subscriptions', passport.authenticate('jwt', {session: false}), subscriptionsRoute);

// thing
const thingsRoute = require('./routes/thingRoute');
router.use('/' + process.env.VERSION + '/things', passport.authenticate('jwt', {session: false}), thingsRoute);

// feature
const featuresRoute = require('./routes/featureRoute');
router.use('/' + process.env.VERSION + '/features', passport.authenticate('jwt', {session: false}), featuresRoute);

// fieldmask
const fieldmasksRoute = require('./routes/fieldmaskRoute');
router.use('/' + process.env.VERSION + '/fieldmasks', passport.authenticate('jwt', {session: false}), fieldmasksRoute);

// computation
const computationsRoute = require('./routes/computationRoute');
router.use('/' + process.env.VERSION + '/computations', passport.authenticate('jwt', {session: false}), computationsRoute);

// constraint
const constraintsRoute = require('./routes/constraintRoute');
router.use('/' + process.env.VERSION + '/constraints', passport.authenticate('jwt', {session: false}), constraintsRoute);

// info 
const infoRoute = require('./routes/infoRoute');
router.use('/' + process.env.VERSION + '/info', passport.authenticate('jwt', {session: false}), infoRoute);

module.exports = router;
