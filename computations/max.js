const Buncher = require('./buncher');
const runner = require('../computations/runner');

exports.run = async function(computation, user, tenant) { 
    const bunch_size = 3
    const buncher = new Buncher(computation, user, runner, bunch_size, tenant);
    await buncher.init();
    let max_measurement = null;
    let page = null;
    while(page = await buncher.next()) {
        const measurements = page.docs;
        console.log(measurements.length);
        for(i=0; i<measurements.length; i++) {
            if(!max_measurement) { max_measurement = measurements[i]; continue; }
            if(measurements[i].samples[0].values[0] > max_measurement.samples[0].values[0]) max_measurement = measurements[i];
        }
    }        
    result = { id: max_measurement._id, value: max_measurement.samples[0].values[0] }; 
    runner.complete(computation, result, tenant);
}
