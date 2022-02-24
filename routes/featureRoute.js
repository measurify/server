const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/', catchErrors(featureController.get));
router.get('/pipe', catchErrors(featureController.pipe));
router.get('/:id', catchErrors(featureController.getone));
router.post('/', catchErrors(featureController.post));
router.delete('/:id', catchErrors(featureController.delete));
router.put('/:id', catchErrors(featureController.put));

module.exports = router;




