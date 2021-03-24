const express = require('express');
const router = express.Router();
const fieldmaskController = require('../controllers/fieldmaskController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(fieldmaskController.get));
router.get('/pipe',  catchErrors(fieldmaskController.pipe));
router.get('/:id', catchErrors(fieldmaskController.getone));
router.post('/', catchErrors(fieldmaskController.post));
router.delete('/:id',  catchErrors(fieldmaskController.delete));
router.put('/:id', catchErrors(fieldmaskController.put));

module.exports = router;
