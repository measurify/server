const express = require('express');
const router = express.Router();
const thingController = require('../controllers/thingController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(thingController.get));
router.get('/pipe',  catchErrors(thingController.pipe));
router.get('/:id', catchErrors(thingController.getone));
router.post('/', catchErrors(thingController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Thing")) });
router.delete('/:id',  catchErrors(thingController.delete));
router.put('/:id', catchErrors(thingController.put));

module.exports = router;
