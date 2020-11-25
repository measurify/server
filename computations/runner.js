const mongoose = require('mongoose');
const ComputationStatusTypes = require('../types/computationStatusTypes'); 
const OutlierFinder = require('../computations/outliers');
const model = require('../computations/model');
const max = require('../computations/max');

exports.progress = async function(computation, percentage, tenant) {
    console.log("Computation: " + computation._id + " progress: " + percentage);
    const Computation = mongoose.dbs[tenant._id].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { progress: percentage } });
}

exports.error = async function(computation, message, tenant) {
    console.log("Computation: " + computation._id + " error: " + message);
    const Computation = mongoose.dbs[tenant._id].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.error } });
}

exports.complete = async function(computation, result, tenant) {
    console.log("Computation: " + computation._id + " complete: " + JSON.stringify(result));
    const Computation = mongoose.dbs[tenant._id].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.concluded, result: result } });
}

exports.go = function(computation, user, tenant) { 
    console.log("Computation: " + computation._id + " started");
    switch (computation.code) {
        case "max": max.run(computation, user, tenant); return true; break;
        case "model": model.run(computation, user, tenant); return true; break;
        default : this.error(computation, 'Code not found', tenant);
    }
}

exports.update = function(computation, user, tenant) {
    switch (computation.code) {
        case "model": model.update(computation, user, tenant); return true; break;
        default: this.error(computation, 'Code not found', tenant);
    }
}