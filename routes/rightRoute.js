const express = require('express');
const router = express.Router();
const rightController = require('../controllers/rightController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(rightController.get));
router.get('/pipe',  catchErrors(rightController.pipe));
router.get('/:id', catchErrors(rightController.getone));
router.post('/', catchErrors(rightController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Right")) });
router.delete('/:id',  catchErrors(rightController.delete));
router.put('/:id', catchErrors(rightController.put));

module.exports = router;
