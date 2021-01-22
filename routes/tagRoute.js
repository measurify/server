const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController.js');
const { catchErrors } = require('../commons/errorHandlers.js');


/**
 * @swagger
 * /tags:
 *   get:
 *     summary: returns a list of the available tags
 *     tags: 
 *       - Tag
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of tags
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/tag'
 */
router.get('/',  catchErrors(tagController.get));

router.get('/pipe',  catchErrors(tagController.pipe));

/**
 * @swagger
 * /tags/{id}:
 *  get:
 *      summary: returns a single tag
 *      tags:
 *          - Tag
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: tag id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single tag
 *              schema:
 *                  $ref: '#paths/definitions/tag'
 *          404:
 *              description: tag not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(tagController.getone));

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: creates one or several tags
 *     tags:
 *       - Tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: feature
 *         description: the object or an array of objects describing the tags to be created
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/tag'
 *     responses:
 *       200:
 *          description: the list of created tags
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/tag'
 *       202:
 *          description: the list of created tags and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/tag'
 */
router.post('/', catchErrors(tagController.post));

/**
 * @swagger
 * /tags:
 *   delete:
 *     summary: deletes a tag, only if it is not used in measurements
 *     tags: 
 *       - Tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: tag id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted tag
 *          schema:
 *              $ref: '#/paths/definitions/tag'
 *       404:
 *          description: tag to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 *       409:
 *          description: tag already used in a measurement
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(tagController.delete));

router.put('/:id', catchErrors(tagController.put));

module.exports = router;