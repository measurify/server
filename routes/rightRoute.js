const express = require('express');
const router = express.Router();
const rightController = require('../controllers/rightController.js');
const { catchErrors } = require('../commons/errorHandlers.js');


 /**
 * @swagger
 * /rights:
 *   
 */
router.get('/',  catchErrors(rightController.get));

router.get('/pipe',  catchErrors(rightController.pipe));

/**
 * @swagger
 * /rights/{id}:
 *          
 */
router.get('/:id', catchErrors(rightController.getone));


/**
 * @swagger
 * /rights:
 *   
 */
router.post('/', catchErrors(rightController.post));

/**
 * @swagger
 * /rights:
 */
router.delete('/:id',  catchErrors(rightController.delete));

/**
 * @swagger
 * /rights:
 */
router.put('/:id', catchErrors(rightController.put));

module.exports = router;
