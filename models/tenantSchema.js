const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;

/**
 * @swagger
 * definitions:
 *      computation:
 *          type: object
 *          required:
 *              - code
 *              - filter
 *          properties:
 *              _id: 
 *                  type: string
 *              name:
 *                  description: a human-readable identifier for the computation
 *                  type: string
 *              owner:
 *                  description: the user how creates the computation
 *                  type: 
 *                      $ref: '#/paths/definitions/user'
 *              code:
 *                  description: the function to be executed during the computation
 *                  type: string
 *              filter:
 *                  description: the filter to collect measurement for the computation
 *                  type: string
 *              status:
 *                  description: the status of the computation (running, paused, error, completed)
 *                  type: string
 *              progress:
 *                  description: the percentage of advancement of the computation
 *                  type: number
 *              startDate:
 *                  description: start time for the computation execution
 *                  type: date
 *              endDate:
 *                  description: start time for the computation execution
 *                  type: date
 *              tags: 
 *                  description: list of labels describing the computation
 *                  type: array
 *                  items:
 *                      $ref: '#/paths/definitions/tag'
 *         
 */

const tenantSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply a valid name" },
    database: { type: String },
    organization: { type: String },
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false },
    passwordhash: {type: Boolean, default: true, }
});

tenantSchema.set('toJSON', { versionKey: false });
tenantSchema.index({ name: 1 });
tenantSchema.plugin(paginate);
tenantSchema.plugin(require('mongoose-autopopulate'));

module.exports = tenantSchema;
