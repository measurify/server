const mongoose = require('mongoose');
const Computation = mongoose.model('Computation');
const ComputationStatusTypes = require('../types/computationStatusTypes'); 
const OutlierFinder = require('../computations/outliers');
const MaxFinder = require('../computations/max');

exports.progress = async function(computation, percentage) {
    await Computation.findByIdAndUpdate(computation._id, { $set: { progress: percentage } });
}

exports.error = async function(computation, message) {
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.error } });
}

exports.complete = async function(computation) {
    await Computation.findByIdAndUpdate(computation._id, { $set: { status: ComputationStatusTypes.concluded } });
}

exports.go = function(computation) { 
    switch (computation.code) {
        case "max": MaxFinder.run(computation); return true; break;
        //case "outliers": OutlierFinder.run(req, res, computation); return true; break;
        default: return false;
    }
}