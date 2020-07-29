const Buncher = require('./buncher');
const runner = require('../computations/runner');

exports.run = async function(computation, user, tenant) { 
    const bunch_size = 3
    const buncher = new Buncher(computation, user, runner, bunch_size, tenant);
    await buncher.init();
    // Create ELM file
    let page = null;
    while(page = await buncher.next()) {
        const measurements = page.docs;
        console.log(measurements.length);
        // Add bunch_size lines to CSV file for ELM
    }        
    
    // Get info about the ELM model from "metadata" field of the measurement
    
    // Call ELM providing CSV file and model parameters
    
    // Wait for ELM result

    // Add result information to an "result" object, files anche be added specifiyng filenames, then we will
    // add a routes to the API in order to dowload them
     
    runner.complete(computation, result, tenant);
}
