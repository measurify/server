const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

 /**
 * @swagger
 * /devices:
 *   get:
 *     summary: returns a list of the available devices
 *     tags: 
 *       - Device
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: an array of devices
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/device'
 */
router.get('/',  catchErrors(deviceController.get));

/**
 * @swagger
 * /devices/{id}:
 *  get:
 *      summary: returns a single device
 *      tags:
 *          - Device
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: id
 *            description: device id
 *            in: path
 *            required: true
 *            type: guid
 *      responses:
 *          200:
 *              description: a single device
 *              schema:
 *                  $ref: '#/paths/definitions/device'
 *          404:
 *              description: device not found
 *              schema:
 *                  $ref: '#/paths/definitions/error'        
 */
router.get('/:id', catchErrors(deviceController.getone));

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: creates one or several devices
 *     tags:
 *       - Device
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: device
 *         description: the object or an array of objects describing the devices to be created
 *         in: body
 *         required: true
 *         schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/device'
 *     responses:
 *       200:
 *          description: the list of created devices
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/device'
 *       202:
 *          description: the list of created devices and the list of errors
 *          schema:
 *              type: array
 *              items:
 *                  $ref: '#/paths/definitions/device'
 */
router.post('/', catchErrors(deviceController.post));

/**
 * @swagger
 * /devices:
 *   delete:
 *     summary: deletes a device, only if it has not recorded measurements
 *     tags: 
 *       - Device
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: device id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *          description: the deleted device
 *          schema:
 *              $ref: '#/paths/definitions/device'
 *       404:
 *          description: device to be deleted not found
 *          schema:
 *              $ref: '#/paths/definitions/error'
 *       409:
 *          description: device already recorded a measurement
 *          schema:
 *              $ref: '#/paths/definitions/error'
 */
router.delete('/:id',  catchErrors(deviceController.delete));

router.put('/:id',  catchErrors(deviceController.put));

module.exports = router;
