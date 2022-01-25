const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController.js');
const datasetController = require('../controllers/datasetController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const datasetCreator = require('../commons/datasetCreator.js');

router.get('/', catchErrors(featureController.get));
router.get('/pipe', catchErrors(featureController.pipe));
router.get('/:id', catchErrors(featureController.getone));
router.get('/:id/dataset', catchErrors(datasetController.get));
router.post('/:id/dataset', busboy({ immediate: true }), (req, res, next) => { datasetCreator.dataExtractor(req, res, next) });
router.post('/', catchErrors(featureController.post));
router.delete('/:id', catchErrors(featureController.delete));
router.put('/:id', catchErrors(featureController.put));

module.exports = router;




