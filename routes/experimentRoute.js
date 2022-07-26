const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experimentController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/', catchErrors(experimentController.get));
router.get('/pipe', catchErrors(experimentController.pipe));
router.get('/:id', catchErrors(experimentController.getone));
router.post('/', catchErrors(experimentController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next, "Experiment")) });
router.delete('/:id', catchErrors(experimentController.delete));
router.put('/:id', catchErrors(experimentController.put));

module.exports = router;
