const Buncher = require('./buncher');
const runner = require('../computations/runner');
const mongoose = require('mongoose');

exports.run = async function(computation, user, tenant) { 
    const Feature = mongoose.dbs[tenant._id].model('Feature');
    const feature = await Feature.findById(computation.feature);
    const results = [];
    for(const item of computation.items) results.push({ item: item, measurement: null, value: null });
    const buncher = new Buncher(computation, user, runner, process.env.COMPUTATION_BUNCH_SIZE, tenant);
    await buncher.init();
    let page = null;
    while(page = await buncher.next()) {
        for(const measurement of page.docs) {
            for(const sample of measurement.samples) {
                for(let i=0; i<sample.values.length; i++) {
                    const item = feature.items[i].name;
                    const value = sample.values[i];
                    if(!computation.items.includes(item)) continue;
                    let result = null;
                    results.some(element => { if(element.item === item) { result = element; return true; }});
                    if(!result.measurement || value > result.value) { 
                        result.measurement = measurement._id;
                        result.value = value 
                    }
                }
            }
        }
    }        
    runner.complete(computation, results, tenant);
}
