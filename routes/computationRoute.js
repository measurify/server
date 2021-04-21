const express = require('express');
const router = express.Router();
const computationController = require('../controllers/computationController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(computationController.get));
router.get('/pipe',  catchErrors(computationController.pipe));
router.get('/:id', catchErrors(computationController.getone));
router.post('/', catchErrors(computationController.post));
router.delete('/:id',  catchErrors(computationController.delete));
router.put('/:id', catchErrors(computationController.put));

module.exports = router;
