const express = require('express');
const router = express.Router();
const constraintController = require('../controllers/constraintController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

 /**
 * @swagger
 * /constraints:
 *   get:
 *     summary: returns a list of the available constraints
 *     tags: 
 *       - Constraint
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of constraints
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/constraint'
 */
router.get('/',  catchErrors(constraintController.get));

/**
 * @swagger
 * /constraints/{id}:
 *  get:
 *      summary: returns a single constraint
 *      tags:
 *          - Constraint
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: constraint id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single constraint
 *              schema:
 *                  $ref: '#/paths/definitions/constraint'
 *          404:
 *              description: constraint not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(constraintController.getone));

/**
 * @swagger
 * /constraints:
 *   post:
 *     summary: creates one or several constraints
 *     tags:
 *       - Constraint
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: constraint
 *         description: the object or an array of objects describing the constraints to be created
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/constraint'
 *     responses:
 *       200:
 *          description: the list of created constraints
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/constraint'
 *       202:
 *          description: the list of created constraints and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/constraint'
 */
router.post('/', catchErrors(constraintController.post));

/**
 * @swagger
 * /constraints:
 *   delete:
 *     summary: deletes a constraint
 *     tags: 
 *       - Constraint
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: constraint id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted constraint
 *          schema:
 *              $ref: '#/paths/definitions/constraint'
 *       404:
 *          description: constraint to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 *       409:
 *          description: constraint already recorded a measurement
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(constraintController.delete));

module.exports = router;
