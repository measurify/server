const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

/**
 * @swagger
 * /measurements:
 *  get:
 *     summary: returns a paginated list of filtered measurements
 *     tags:
 *       - Measurement 
 *     parameters:
 *       - name: query
 *         description: query criteria for the filter specified using mongo rules https://docs.mongodb.com/manual/tutorial/query-documents/
 *         in: query
 *         example: { feature: average-speed }
 *         required: false
 *         type: json
 *       - name: sort
 *         description: specifies the field(s) to sort by and the respective sort order (asc or desc)
 *         in: query
 *         example: { startDate: desc } 
 *         required: false
 *         type: json
 *       - name: select
 *         description: fields to return (by default returns all fields)
 *         in: query
 *         example: { startDate: 0 } 
 *         required: false
 *         type: json
 *       - name: page
 *         description: page number of the request
 *         in: query
 *         example: 1
 *         required: false
 *         type: number
 *       - name: limit
 *         description: number of measurements to be returned
 *         in: query
 *         example: 10
 *         required: false
 *         type: number
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: the list of measurements
 *         schema:
 *           $ref: '#/paths/definitions/measurements'
 *       400:
 *         description: errors in the request
 *         schema:
 *           $ref: '#/paths/definitions/error'
 */
router.get('/',  catchErrors(measurementController.get));

/**
 * @swagger
 * /measurements/count:
 *  get:
 *     summary: returns a the size of a list of filtered measurements
 *     tags:
 *       - Measurement 
 *     parameters:
 *       - name: query
 *         description: query criteria for the filter specified using mongo rules https://docs.mongodb.com/manual/tutorial/query-documents/
 *         in: query
 *         example: { feature: average-speed }
 *         required: false
 *         type: json
 *       - name: sort
 *         description: specifies the field(s) to sort by and the respective sort order (asc or desc)
 *         in: query
 *         example: { startDate: desc } 
 *         required: false
 *         type: json
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: the list of measurements
 *         schema:
 *           $ref: '#/paths/definitions/measurements'
 *       400:
 *         description: errors in the request
 *         schema:
 *           $ref: '#/paths/definitions/error'
 */
router.get('/count',  catchErrors(measurementController.count));

/**
 * @swagger
 * /measurements/{id}:
 *  get:
 *      summary: returns a single measurement
 *      tags:
 *          - Measurement
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: measurement id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single measurement
 *              schema:
 *                  $ref: '#/paths/definitions/measurement'
 *          404:
 *              description: measurement not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(measurementController.getone));

router.get('/:id/file', catchErrors(measurementController.getfile));

/**
 * @swagger
 * /measurements:
 *   post:
 *     summary: creates one or several measurements
 *     tags:
 *       - Measurement
 *     description: creates a new measurement
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: measurement
 *         description: measurement object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/paths/definitions/measurement'
 *     responses:
 *       200:
 *         description: successfully created
 */
router.post('/', catchErrors(measurementController.post));

/**
 * @swagger
 * /measurements:
 *   delete:
 *     summary: deletes a single measurement
 *     tags: 
 *       - Measurement
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: measurement id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted measurement
 *          schema:
 *              $ref: '#/paths/definitions/measurement'
 *       404:
 *          description: measurement to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(measurementController.deleteone));

router.delete('/',  catchErrors(measurementController.delete));


/**
 * @swagger
 * /measurements:
 *   put:
 *     summary: updates one measurement
 *     tags:
 *       - Measurement
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: measurement id
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/measurement'
 *     responses:
 *       200:
 *          description: the updated measurement
 *          schema:
 *              $ref: '#/paths/definitions/measurement'
 *       404:
 *          description: Measurement to be updated not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.put('/:id', catchErrors(measurementController.put));


module.exports = router;