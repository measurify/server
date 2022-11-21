const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController.js');
const timeserieController = require('../controllers/timeserieController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const dataset = require('../commons/dataset.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(measurementController.get));
router.get('/count',  catchErrors(measurementController.count));
router.get('/pipe',  catchErrors(measurementController.pipe));
router.get('/:id', catchErrors(measurementController.getone));
router.get('/:id/file', catchErrors(measurementController.getfile));
router.post('/', catchErrors(measurementController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(dataset.dataExtractor(req, res, next,false)) });
router.delete('/:id',  catchErrors(measurementController.deleteone));
router.delete('/',  catchErrors(measurementController.delete));
router.put('/:id', catchErrors(measurementController.put));

router.get('/:id/timeserie/',  catchErrors(timeserieController.get));
router.get('/:id/timeserie/count',  catchErrors(timeserieController.count));
router.get('/:id/timeserie/:id_timesample', catchErrors(timeserieController.getone));
router.post('/:id/timeserie/', catchErrors(timeserieController.post));
router.post('/:id/timeserie/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Timesample")) });
router.delete('/:id/timeserie/:id_timesample',  catchErrors(timeserieController.deleteone));
router.delete('/:id/timeserie/',  catchErrors(timeserieController.delete));

module.exports = router;