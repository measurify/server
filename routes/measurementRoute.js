const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(measurementController.get));
router.get('/count',  catchErrors(measurementController.count));
router.get('/pipe',  catchErrors(measurementController.pipe));
router.get('/:id', catchErrors(measurementController.getone));
router.get('/:id/file', catchErrors(measurementController.getfile));
router.post('/', catchErrors(measurementController.post));
router.delete('/:id',  catchErrors(measurementController.deleteone));
router.delete('/',  catchErrors(measurementController.delete));
router.put('/:id', catchErrors(measurementController.put));

module.exports = router;