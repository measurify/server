const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/', catchErrors(featureController.get));
router.get('/pipe', catchErrors(featureController.pipe));
router.get('/:id', catchErrors(featureController.getone));
router.post('/', catchErrors(featureController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Feature")) });
router.delete('/:id', catchErrors(featureController.delete));
router.put('/:id', catchErrors(featureController.put));
router.put('/:id/items/:id2', catchErrors(featureController.putItem));


module.exports = router;




