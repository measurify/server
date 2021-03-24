const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(subscriptionController.get));
router.get('/pipe',  catchErrors(subscriptionController.pipe));
router.get('/:id', catchErrors(subscriptionController.getone));
router.post('/', catchErrors(subscriptionController.post));
router.delete('/:id',  catchErrors(subscriptionController.delete));
router.put('/:id', catchErrors(subscriptionController.put));

module.exports = router;
