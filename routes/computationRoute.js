const express = require('express');
const router = express.Router();
const computationController = require('../controllers/computationController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(computationController.get));
router.get('/pipe',  catchErrors(computationController.pipe));
router.get('/:id', catchErrors(computationController.getone));
router.post('/', catchErrors(computationController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Computation")) });
router.delete('/:id',  catchErrors(computationController.delete));
router.put('/:id', catchErrors(computationController.put));

module.exports = router;
