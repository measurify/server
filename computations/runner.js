const mongoose = require('mongoose');
const ComputationStatusTypes = require('../types/computationStatusTypes'); 
const OutlierFinder = require('../computations/outliers');
//const model = require('../computations/model');
//const max = require('../computations/max');

exports.progress = async function(computation, percentage, tenant) {
    console.log("Computation: " + computation._id + " progress: " + percentage);
    const Computation = mongoose.dbs[tenant.database].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { progress: percentage } });
}

exports.error = async function(computation, message, tenant) {
    console.log("Computation: " + computation._id + " error: " + message);
    const Computation = mongoose.dbs[tenant.database].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.error } });
}

exports.complete = async function(computation, results, tenant) {
    console.log("Computation: " + computation._id + " completed");
    const Computation = mongoose.dbs[tenant.database].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.concluded, results: results } });
}

exports.go = function(computation, user, tenant) { 
    console.log("Computation: " + computation._id + " started");
    switch (computation.code) {
        //case "max": max.run(computation, user, tenant); return true; break;
        //case "model": model.run(computation, user, tenant); return true; break;
        default : this.error(computation, 'Code not found', tenant);
    }
}