const express = require('express');
const router = express.Router();
const computationController = require('../controllers/computationController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

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
router.post('/:id', catchErrors(computationController.hook));


module.exports = router;
