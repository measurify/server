const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(roleController.get));
router.get('/pipe',  catchErrors(roleController.pipe));
router.get('/:id', catchErrors(roleController.getone));
router.post('/', catchErrors(roleController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Role")) });
router.delete('/:id',  catchErrors(roleController.delete));
router.put('/:id', catchErrors(roleController.put));
router.put('/:id/status', catchErrors(roleController.accept));

module.exports = router;
