const mongoose = require('mongoose');
const ComputationStatusTypes = require('../types/computationStatusTypes'); 
const OutlierFinder = require('../computations/outliers');
const MaxFinder = require('../computations/max');

exports.progress = async function(computation, percentage, tenant) {
    const Computation = mongoose.dbs[tenant].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { progress: percentage } });
}

exports.error = async function(computation, message, tenant) {
    const Computation = mongoose.dbs[tenant].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.error } });
}

exports.complete = async function(computation, tenant) {
    const Computation = mongoose.dbs[tenant].model('Computation');
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.concluded } });
}

exports.go = function(computation, tenant) { 
    switch (computation.code) {
        case "max": MaxFinder.run(computation, tenant); return true; break;
        //case "outliers": OutlierFinder.run(req, res, computation); return true; break;
        default: return false;
    }
}