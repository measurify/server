const express = require('express');
const router = express.Router();
const datauploadController = require('../controllers/datauploadController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(datauploadController.get));
router.get('/pipe',  catchErrors(datauploadController.pipe));
router.get('/:id', catchErrors(datauploadController.getone));
router.post('/', catchErrors(datauploadController.post));
router.delete('/:id',  catchErrors(datauploadController.delete));
router.put('/:id', catchErrors(datauploadController.put));

module.exports = router;
