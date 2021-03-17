const express = require('express');
const router = express.Router();
const modelsController = require('../controllers/modelsController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(modelsController.get));

module.exports = router;
