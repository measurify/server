const express = require('express');
const router = express.Router();
const passport = require('passport');

// login
const loginRoute = require('./routes/loginRoute');
router.use('/' + process.env.VERSION + '/login', loginRoute);

// demo
if (process.env.DEMO === 'true') {
    const demoRoute = require('./routes/demoRoute');
    router.use('/' + process.env.VERSION + '/demo', passport.authenticate('jwt-token', {session: false}), demoRoute);
}

// tenants
const tenantRoute = require('./routes/tenantRoute');
router.use('/' + process.env.VERSION + '/tenants', passport.authenticate('api-token', {session: false}), tenantRoute);

// log
const logRoute = require('./routes/logRoute');
router.use('/' + process.env.VERSION + '/log', passport.authenticate('jwt-token', {session: false}), logRoute);

// errors
const errorRoute = require('./routes/docsRoute');
router.use('/' + process.env.VERSION + '/docs', errorRoute);

// docs
const docsRoute = require('./routes/errorRoute');
router.use('/' + process.env.VERSION + '/errors', docsRoute);

// user
const userRoute = require('./routes/userRoute');
router.use('/' + process.env.VERSION + '/users', passport.authenticate('jwt-token', {session: false}), userRoute);
const usernameRoute = require('./routes/usernameRoute');
router.use('/' + process.env.VERSION + '/usernames', passport.authenticate('jwt-token', {session: false}), usernameRoute);
const selfRoute = require('./routes/selfRoute');
router.use('/' + process.env.VERSION + '/self', selfRoute);

// measurement
const measurementsRoute = require('./routes/measurementRoute');
router.use('/' + process.env.VERSION + '/measurements', passport.authenticate('jwt-token', {session: false}), measurementsRoute);

// tag
const tagsRoute = require('./routes/tagRoute');
router.use('/' + process.env.VERSION + '/tags', passport.authenticate('jwt-token', {session: false}), tagsRoute);

// Issue
const issuesRoute = require('./routes/issueRoute');
router.use('/' + process.env.VERSION + '/issues', passport.authenticate('jwt-token', {session: false}), issuesRoute);

// device
const devicesRoute = require('./routes/deviceRoute');
router.use('/' + process.env.VERSION + '/devices', passport.authenticate('jwt-token', {session: false}), devicesRoute);

// script
const scriptsRoute = require('./routes/scriptRoute');
router.use('/' + process.env.VERSION + '/scripts', passport.authenticate('jwt-token', {session: false}), scriptsRoute);

// right
const rightsRoute = require('./routes/rightRoute');
router.use('/' + process.env.VERSION + '/rights', passport.authenticate('jwt-token', {session: false}), rightsRoute);

// subscription
const subscriptionsRoute = require('./routes/subscriptionRoute');
router.use('/' + process.env.VERSION + '/subscriptions', passport.authenticate('jwt-token', {session: false}), subscriptionsRoute);

// thing
const thingsRoute = require('./routes/thingRoute');
router.use('/' + process.env.VERSION + '/things', passport.authenticate('jwt-token', {session: false}), thingsRoute);

// feature
const featuresRoute = require('./routes/featureRoute');
router.use('/' + process.env.VERSION + '/features', passport.authenticate('jwt-token', {session: false}), featuresRoute);

// type
const typesRoute = require('./routes/typeRoute');
router.use('/' + process.env.VERSION + '/types', typesRoute);

// fieldmask
const fieldmasksRoute = require('./routes/fieldmaskRoute');
router.use('/' + process.env.VERSION + '/fieldmasks', passport.authenticate('jwt-token', {session: false}), fieldmasksRoute);

// computation
const computationsRoute = require('./routes/computationRoute');
router.use('/' + process.env.VERSION + '/computations', passport.authenticate('jwt-token', {session: false}), computationsRoute);

// constraint
const constraintsRoute = require('./routes/constraintRoute');
router.use('/' + process.env.VERSION + '/constraints', passport.authenticate('jwt-token', {session: false}), constraintsRoute);

// info 
const infoRoute = require('./routes/infoRoute');
router.use('/' + process.env.VERSION + '/info', passport.authenticate('jwt-token', {session: false}), infoRoute);

module.exports = router;
