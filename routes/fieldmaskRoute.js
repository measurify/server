const express = require('express');
const router = express.Router();
const fieldmaskController = require('../controllers/fieldmaskController.js');
const { catchErrors } = require('../commons/errorHandlers.js');


 /**
 * @swagger
 * /fieldmasks:
 *   
 */
router.get('/',  catchErrors(fieldmaskController.get));

/**
 * @swagger
 * /fieldmasks/{id}:
 *          
 */
router.get('/:id', catchErrors(fieldmaskController.getone));


/**
 * @swagger
 * /fieldmasks:
 *   
 */
router.post('/', catchErrors(fieldmaskController.post));

/**
 * @swagger
 * /fieldmasks:
 */
router.delete('/:id',  catchErrors(fieldmaskController.delete));

/**
 * @swagger
 * /fieldmasks:
 */
router.put('/:id', catchErrors(fieldmaskController.put));

module.exports = router;
