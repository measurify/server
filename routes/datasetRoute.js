const express = require('express');
const router = express.Router();
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const dataset = require('../commons/dataset.js');
const datasetController = require('../controllers/datasetController.js');

router.get('/', catchErrors(datasetController.get));
router.get('/:id', catchErrors(datasetController.get));
router.get('/:id/info', catchErrors(datasetController.getoneDataupload));
router.post('/', busboy({ immediate: true }), (req, res, next) => { catchErrors(dataset.dataExtractor(req, res, next,true)) });
router.delete('/:id',  catchErrors(datasetController.delete));

module.exports = router;



