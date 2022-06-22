const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(subscriptionController.get));
router.get('/pipe',  catchErrors(subscriptionController.pipe));
router.get('/:id', catchErrors(subscriptionController.getone));
router.post('/', catchErrors(subscriptionController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Subscription")) });
router.delete('/:id',  catchErrors(subscriptionController.delete));
router.put('/:id', catchErrors(subscriptionController.put));

module.exports = router;
