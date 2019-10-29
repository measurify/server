const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

 /**
 * @swagger
 * /features:
 *   get:
 *     summary:  returns a list of the available features
 *     tags: 
 *       - Feature
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of features
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/feature'
 */
router.get('/',  catchErrors(featureController.get));

/**
 * @swagger
 * /features/{id}:
 *  get:
 *      summary: returns a single feature
 *      tags:
 *          - Feature
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: feature id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single feature
 *              schema:
 *                  $ref: '#paths/definitions/feature'
 *          404:
 *              description: feature not found
 *              schema:
 *                  $ref: '#paths/definitions/error'        
 */
router.get('/:id', catchErrors(featureController.getone));

/**
 * @swagger
 * /features:
 *   post:
 *     summary: creates one or several features
 *     tags:
 *       - Feature
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: feature
 *         description: the object or an array of objects describing the features to be created
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/feature'
 *     responses:
 *       200:
 *          description: the list of created features
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/feature'
 *       202:
 *          description: the list of created features and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/feature'
 */
router.post('/', catchErrors(featureController.post));

/**
 * @swagger
 * /features:
 *   delete:
 *     summary: deletes a feature, only if it is not used in measurements
 *     tags: 
 *       - Feature
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: feature id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted feature
 *          schema:
 *              $ref: '#/paths/definitions/feature'
 *       404:
 *          description: feature to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 *       409:
 *          description: feature already used in a measurement
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(featureController.delete));

module.exports = router;
