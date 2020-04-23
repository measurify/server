const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { catchErrors } = require('../commons/errorHandlers');

router.post('/', catchErrors(userController.self));
router.get('/', catchErrors(userController.password));
router.get('/:id', catchErrors(userController.awaiting));
router.post('/reset', catchErrors(userController.reset));

module.exports = router;
