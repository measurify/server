const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(deviceController.get));
router.get('/pipe',  catchErrors(deviceController.pipe));
router.get('/:id', catchErrors(deviceController.getone));
router.post('/', catchErrors(deviceController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Device")) });
router.delete('/:id',  catchErrors(deviceController.delete));
router.put('/:id',  catchErrors(deviceController.put));

module.exports = router;
