const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(issueController.get));
router.get('/:id', catchErrors(issueController.getone));
router.get('/pipe',  catchErrors(issueController.pipe));
router.get('/types',  catchErrors(issueController.getTypes));
router.get('/status',  catchErrors(issueController.getStatusTypes));
router.post('/', catchErrors(issueController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Issue")) });
router.delete('/:id',  catchErrors(issueController.delete));
router.put('/:id',  catchErrors(issueController.put));

module.exports = router;
