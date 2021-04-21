const express = require('express');
const router = express.Router();
const scriptController = require('../controllers/scriptController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

router.get('/',  catchErrors(scriptController.get));
router.get('/pipe',  catchErrors(scriptController.pipe));
router.get('/:id', catchErrors(scriptController.getone));
router.post('/', catchErrors(scriptController.post));
router.delete('/:id',  catchErrors(scriptController.delete));
router.put('/:id', catchErrors(scriptController.put));

module.exports = router;
