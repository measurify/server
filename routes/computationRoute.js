const express = require('express');
const router = express.Router();
const computationController = require('../controllers/computationController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

 /**
 * @swagger
 * /computations:
 *   get:
 *     summary: returns a list of the available computations
 *     tags: 
 *       - Computation
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of computations
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/computation'
 */
router.get('/',  catchErrors(computationController.get));

/**
 * @swagger
 * /computations/{id}:
 *  get:
 *      summary: returns a single computation
 *      tags:
 *          - Computation
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: computation id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single computation
 *              schema:
 *                  $ref: '#/paths/definitions/computation'
 *          202:
 *              description: a computation is pending
 *              schema:
 *                  $ref: '#/paths/definitions/warning'
 *          404:
 *              description: computation not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(computationController.getone));

/**
 * @swagger
 * /computations:
 *   post:
 *     summary: creates one or several computations
 *     tags:
 *       - Computation
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: computation
 *         description: the object or an array of objects describing the computations to be computed
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/computation'
 *     responses:
 *       200:
 *          description: the list of created computations
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/computation'
 *       202:
 *          description: the list of created computations and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/computation'
 */
router.post('/', catchErrors(computationController.post));

/**
 * @swagger
 * /computations:
 *   delete:
 *     summary: deletes a computation
 *     tags: 
 *       - Computation
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: computation id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted computation
 *          schema:
 *              $ref: '#/paths/definitions/computation'
 *       404:
 *          description: computation to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(computationController.delete));

/**
 * @swagger
 * /computations:
 *   put:
 *     summary: updates one computation
 *     tags:
 *       - Computation
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: computation
 *         description: the object or an array of objects describing the computation to be computed
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/computation'
 *     responses:
 *       200:
 *          description: the updated computation
 *          schema:
 *              $ref: '#/paths/definitions/computation'
 *       404:
 *          description: computation to be updated not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.put('/:id', catchErrors(computationController.put));

module.exports = router;
