const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(infoController.get));
router.get('/passwordStrength',  catchErrors(infoController.getPasswordStrength));

module.exports = router;
