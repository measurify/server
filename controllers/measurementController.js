const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Measurement = mongoose.model('Measurement');
const Thing = mongoose.model('Thing');
const Feature = mongoose.model('Feature');
const User = mongoose.model('User');
const Authorization = require('../security/authorization.js');
const ObjectId = require('mongoose').Types.ObjectId;
const paginate = require("paginate-array");
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Measurement); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, null, Measurement); 
};

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Measurement);
};

exports.deleteOne = async (req, res) => {
    let result = await checker.isAvailable(req, res, Measurement); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    return await manager.deleteResource(req, res, Measurement);
}

exports.delete = async (req, res) => {
    if (!req.query.filter) return errors.manage(res, errors.measurement_delete_needs_filter);
    if (req.query.filter.startsWith("[")) { req.query.filter = "{ \"$or\": " + req.query.filter + " }" };
    req.query.filter = "{ \"$and\": [" + req.query.filter + " ,{\"owner\": \"" + req.user._id + "\"} ]}"
    const filter = JSON.parse(req.query.filter);
    const result = await Measurement.deleteMany(filter);
    if (result.n == 0) return errors.manage(res, errors.measurement_not_found, req.params.id);
    else return res.status(200).json({ message: + result.n + " measurements deleted!" });
};



/*
exports.put = async (req, res) => {
    try {
        // update by id
        if (req.params.id) {
            const measurement = await Measurement.findById(req.params.id);
            if (!Authorization.isOwner(req.user, measurement))
                return res.status(403).json({ status: 403, message: "Only the owner can update a measurement" });
            var feature = req.body.feature;
            if (!feature)
                feature = measurement.feature;
            var baseFeatures = [req.body.baseFeatures];
            if (!baseFeatures)
                baseFeatures = measurement.baseFeatures;
            var values = req.body.values;
            if (!values)
                values = measurement.values;
            const measurementres = await Measurement.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, {
                feature: feature,
                baseFeatures: baseFeatures,
                values: values
            });
            if (!measurementres)
                return res.status(404).json({ message: "Measurement " + req.params.id + " not found" });
            else {
                return res.status(200).json({ message: "Measurement " + req.params.id + " updated" });
            }
        }
        // upsert by filter
        else {
            var body = new Measurement(req.body);

            // construct a query from body info
            //var measurementTagsRaw = body.tags;
            var measurementTags = body.tags;
            var measurementFeature = body.feature;
            var measurementBaseFeatures = body.baseFeatures;
            var measurementThing = body.thing;
            if (measurementThing) {
                var thingReturned = await Thing.findById(measurementThing);
                if (!thingReturned) {
                    return res.status(404).json({ message: "Thing does not exist!" });
                }
                var relatedThings = thingReturned.relations;
                if (relatedThings.length != 0) {
                    var embeddedThings = relatedThings[0].thingIds;
                    req.body.relatedThings = embeddedThings;
                }
            }
            if (measurementBaseFeatures) {
                for (var i = 0; i < measurementBaseFeatures.length; i++) {
                    var featureReturned = await Feature.findById(measurementBaseFeatures[i]);
                    if (!featureReturned) {
                        return res.status(404).json({ message: "At least one baseFeature does not exist!" });
                    }
                }
            }
            //var measurementStartDate = body.startDate;
            //var measurementEndDate = body.endDate;
            //var metadata = body.thingMetadata;
            var arrayConditions = [];
            //var elementTags = [];
            var logicName = "$and";
            //var elemetMatch = "$elemMatch";
            if (measurementTags.length != 0) {
                var tagName = "tags";
                var sizeName = "$size";
                var allname = "$all";
                //var combinedObject = { [sizeName]: measurementTags.length, [allname]: measurementTags }
                //var combinedObject = { [allname]: measurementTags }
                //arrayConditions.push({ [tagName]: combinedObject });
                arrayConditions.push({ [tagName]: measurementTags });
            }

            if (measurementFeature) {
                var featureName = "feature";
                arrayConditions.push({ [featureName]: measurementFeature });
            }

            if (measurementBaseFeatures.length != 0) {
                var baseFeaturesName = "baseFeatures";
                //for (var i = 0; i < measurementBaseFeatures.length; i++)
                arrayConditions.push({ [baseFeaturesName]: measurementBaseFeatures });
            }

            if (measurementThing) {
                var thingName = "thing";
                arrayConditions.push({ [thingName]: measurementThing });
            }

            var measurements = await Measurement.find({ [logicName]: arrayConditions });

            req.body.owner = req.user._id;

            if (measurements.length > 1)
                return res.status(404).json({ message: "Filter points to multiple measurements, please narrow it down!" });
            else {
                var feature = req.body.feature;
                var baseFeatures = req.body.baseFeatures;
                var values = req.body.values;
                if ((measurements.length == 0 && (!feature || !baseFeatures || !values)))
                    return res.status(404).json({ message: "Error while attempting to insert since no Measurement was found to update, inserting needs more arguments: (feature, baseFeatures, or values!)" });
                else {
                    if (!feature)
                        feature = measurements.feature;
                    if (!baseFeatures)
                        baseFeatures = measurements.baseFeatures;
                    if (!values)
                        values = measurements.values;
                }

                var bodyElement = req.body;
                // Check if values are not numeric, thus convert (this is needed in case of inserting ref. IDs as value)
                // For UI to get the reverse conversion: hexString = value.toString(16);
                var values = bodyElement.values;
                for (var i = 0; i < values.length; i++) {
                    var value = values[i].value;
                    for (var l = 0; l < value.length; l++) {
                        if (typeof (value[l]) != 'number') {
                            var output = "";
                            var splitOutput = [];
                            var input = bodyElement.values[i].value[l];
                            // split each hex char and convert to decimal and store separately in sub-array
                            // reason: js can only parse to 53rd bit, the id is 154 bits!
                            for (var n = 0; n < input.length; n++) {
                                output = input[n];
                                splitOutput.push(parseInt(output, 16));
                            }
                            bodyElement.values[i].value[l] = splitOutput;
                        }
                    }
                }
                var measurement_new = new Measurement(bodyElement);
                for (var j = 0; j < measurement_new.values.length; j++) {
                    var vector = [];
                    var sum = 0;
                    for (var k = 0; k < measurement_new.values[j].value.length; k++) {
                        for (var l = 0; l < measurement_new.values[j].value[k].length; l++) {
                            vector[k] = Math.pow(measurement_new.values[j].value[k][l], 2);
                            sum += vector[k];
                        }
                    }
                    measurement_new.values[j].magnitude = Math.sqrt(sum);
                }

                var measurement = await Measurement.findOneAndUpdate({
                    [logicName]:
                        arrayConditions
                },
                    { $set: req.body },
                    {
                        feature: feature,
                        baseFeatures: [baseFeatures],
                        values: measurement_new.values,
                        upsert: true,
                        returnNewDocument: true
                    }

                if (!measurement)
                    return res.status(200).json({ message: "Measurement created" });
                else {
                    return res.status(200).json({ message: "Measurement updated" });
                }

            }
        }
    }
    catch (err) {
        if (err.name == 'CastError')
            return res.status(404).json({ message: "Measurement upsert not successful!" });
        else
            throw (err);
    }
};
*/
