const express = require('express');
const router = express.Router();
const rightController = require('../controllers/rightController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(rightController.get));
router.get('/pipe',  catchErrors(rightController.pipe));
router.get('/:id', catchErrors(rightController.getone));
router.post('/', catchErrors(rightController.post));
router.delete('/:id',  catchErrors(rightController.delete));
router.put('/:id', catchErrors(rightController.put));

module.exports = router;
