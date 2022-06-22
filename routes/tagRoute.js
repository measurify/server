const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(tagController.get));
router.get('/pipe',  catchErrors(tagController.pipe));
router.get('/:id', catchErrors(tagController.getone));
router.post('/', catchErrors(tagController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Tag")) });
router.delete('/:id',  catchErrors(tagController.delete));
router.put('/:id', catchErrors(tagController.put));

module.exports = router;