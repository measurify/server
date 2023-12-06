const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experimentController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/', catchErrors(experimentController.get));
router.get('/pipe', catchErrors(experimentController.pipe));
router.get('/aggregated_experiments', catchErrors(experimentController.getAggregates));
router.get('/:id', catchErrors(experimentController.getone));
router.get('/:id/history', catchErrors(experimentController.gethistory));
router.get('/:id/group', catchErrors(experimentController.getgroup));
router.post('/', catchErrors(experimentController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next, "Experiment")) });
router.delete('/:id', catchErrors(experimentController.delete));
router.put('/:id', catchErrors(experimentController.put));
router.put('/:id/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next, "Experiment")) });


module.exports = router;
