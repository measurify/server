// Based on http://en.wikipedia.org/wiki/Interquartile_range#Interquartile_range_and_outliers

const Buncher = require('./buncher');
const runner = require('../computations/runner');

exports.run = async function(computation) { 
    const bunch_size = 3
    const buncher = new Buncher(computation, runner, bunch_size);
    await buncher.init();
    let measurements = null;
    while(measurements = await buncher.next())
        console.log(measurements.page);
    runner.complete(computation);
}
