const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const busboy = require('connect-busboy');
const extractData = require('../commons/extractData.js');

router.get('/',  catchErrors(tenantController.get));
router.get('/:id', catchErrors(tenantController.getone));
router.post('/', catchErrors(tenantController.post));
router.post('/file', busboy({ immediate: true }), (req, res, next) => { catchErrors(extractData.dataExtractor(req, res, next,"Tenant")) });
router.delete('/:id',  catchErrors(tenantController.delete));
router.put('/:id', catchErrors(tenantController.put));

module.exports = router;
