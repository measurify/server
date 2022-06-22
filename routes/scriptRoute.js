const express = require('express');
const router = express.Router();
const scriptController = require('../controllers/scriptController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(scriptController.get));
router.get('/pipe',  catchErrors(scriptController.pipe));
router.get('/:id', catchErrors(scriptController.getone));
router.post('/', catchErrors(scriptController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Script")) });
router.delete('/:id',  catchErrors(scriptController.delete));
router.put('/:id', catchErrors(scriptController.put));

module.exports = router;
