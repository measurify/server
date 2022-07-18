const express = require('express');
const router = express.Router();
const protocolController = require('../controllers/protocolController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/', catchErrors(protocolController.get));
router.get('/pipe', catchErrors(protocolController.pipe));
router.get('/:id', catchErrors(protocolController.getone));
router.post('/', catchErrors(protocolController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next, "Protocol")) });
router.delete('/:id', catchErrors(protocolController.delete));
router.put('/:id', catchErrors(protocolController.put));

module.exports = router;




