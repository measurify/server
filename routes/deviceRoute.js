const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(deviceController.get));
router.get('/pipe',  catchErrors(deviceController.pipe));
router.get('/:id', catchErrors(deviceController.getone));
router.post('/', catchErrors(deviceController.post));
router.delete('/:id',  catchErrors(deviceController.delete));
router.put('/:id',  catchErrors(deviceController.put));

module.exports = router;
