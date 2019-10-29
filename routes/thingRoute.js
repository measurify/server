const express = require('express');
const router = express.Router();
const thingController = require('../controllers/thingController.js');
const { catchErrors } = require('../commons/errorHandlers.js');


 /**
 * @swagger
 * /things:
 *   get:
 *     tags: 
 *       - Thing
 *     summary:  returns a list of the available things
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of things
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/thing'
 */
router.get('/',  catchErrors(thingController.get));

/**
 * @swagger
 * /things/{id}:
 *  get:
 *      summary: returns a single thing
 *      tags:
 *          - Thing
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: thing id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a thing tag
 *              schema:
 *                  $ref: '#paths/definitions/thing'
 *          404:
 *              description: thing not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(thingController.getone));


/**
 * @swagger
 * /things:
 *   post:
 *     summary: creates one or several things
 *     tags:
 *       - Thing
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: thing
 *         description: the object or an array of objects describing the things to be created
 *         in: body
 *         required: true
 *         schema:
 *          $ref: '#/paths/definitions/thing'
 *     responses:
 *       200:
 *          description: the list of created tags
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/thing'
 *       202:
 *          description: the list of created things and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/thing'
 */
router.post('/', catchErrors(thingController.post));

/**
 * @swagger
 * /things:
 *   delete:
 *     summary: deletes a thing, only if it is not subject of measurements
 *     tags: 
 *       - Thing
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: thing id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted thing
 *          schema:
 *              $ref: '#/paths/definitions/thing'
 *       404:
 *          description: thing to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 *       409:
 *          description: thing already subject of measurements
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(thingController.delete));

/**
 * @swagger
 * /things:
 *   put:
 *     summary: updates one thing
 *     tags:
 *       - Thing
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: thing id
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/thing'
 *     responses:
 *       200:
 *          description: the updated thing
 *          schema:
 *              $ref: '#/paths/definitions/thing'
 *       404:
 *          description: Thing to be updated not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.put('/:id', catchErrors(thingController.put));

module.exports = router;
