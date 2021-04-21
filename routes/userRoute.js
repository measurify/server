const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(userController.get));
router.get('/pipe',  catchErrors(userController.pipe));
router.get('/:id', catchErrors(userController.getone));
router.post('/', catchErrors(userController.post));
router.delete('/:id',  catchErrors(userController.delete));
router.put('/:id', catchErrors(userController.put));
router.put('/:id/status', catchErrors(userController.accept));

module.exports = router;
