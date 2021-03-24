const express = require('express');
const router = express.Router();
const constraintController = require('../controllers/constraintController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(constraintController.get));
router.get('/pipe',  catchErrors(constraintController.pipe));
router.get('/:id', catchErrors(constraintController.getone));
router.post('/', catchErrors(constraintController.post));
router.delete('/:id',  catchErrors(constraintController.delete));
router.put('/:id', catchErrors(constraintController.put));

module.exports = router;
