const Buncher = require('./buncher');
const runner = require('../computations/runner');

exports.run = async function(computation, tenant) { 
    const bunch_size = 3
    const buncher = new Buncher(computation, runner, bunch_size, tenant);
    await buncher.init();
    let measurements = null;
    while(measurements = await buncher.next())
        console.log(measurements.page);
    runner.complete(computation, tenant);
}
