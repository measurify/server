const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { catchErrors } = require('../commons/errorHandlers');

router.get('/',  catchErrors(userController.getusernames));

module.exports = router;
