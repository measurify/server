const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController.js');
const { catchErrors } = require('../commons/errorHandlers.js');

 /**
 * @swagger
 * /scripts:
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
router.get('/',  catchErrors(alertController.get));

router.get('/types',  catchErrors(alertController.getTypes));

/**
 * @swagger
 * /scripts:
 *   post:
 *     summary: creates one or several script
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
router.post('/', catchErrors(alertController.post));

module.exports = router;
