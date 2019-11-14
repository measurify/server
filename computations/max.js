// Based on http://en.wikipedia.org/wiki/Interquartile_range#Interquartile_range_and_outliers

const mongoose = require('mongoose');
const persistence = require('../commons/persistence');
const authorization = require('../security/authorization');
const Measurement = mongoose.model('Measurement');
const Buncher = equire('./buncher');
const runner = require('../computations/runner');

exports.run = async function(computation) { 
    const bunch_size = 3
    const buncher = new Boucher(computation, runner, bunch_size);
    await buncher.init();

    while(measurements = buncher.next())
        console.log(measurements);
    
    runner.complete(computation);
}
