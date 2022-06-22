const express = require('express');
const router = express.Router();
const constraintController = require('../controllers/constraintController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(constraintController.get));
router.get('/pipe',  catchErrors(constraintController.pipe));
router.get('/:id', catchErrors(constraintController.getone));
router.post('/', catchErrors(constraintController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Constraint")) });
router.delete('/:id',  catchErrors(constraintController.delete));
router.put('/:id', catchErrors(constraintController.put));

module.exports = router;
