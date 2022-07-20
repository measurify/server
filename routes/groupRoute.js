const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(groupController.get));
router.get('/pipe',  catchErrors(groupController.pipe));
router.get('/:id', catchErrors(groupController.getone));
router.post('/', catchErrors(groupController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Group")) });
router.delete('/:id',  catchErrors(groupController.delete));
router.put('/:id', catchErrors(groupController.put));

module.exports = router;
