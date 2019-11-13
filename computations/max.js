// Based on http://en.wikipedia.org/wiki/Interquartile_range#Interquartile_range_and_outliers

const mongoose = require('mongoose');
const persistence = require('../commons/persistence');
const checker = require('../controllers/checker');
const Measurement = mongoose.model('Measurement');
const runner = require('../computations/runner');

exports.run = async function(req, res, computation) { 
    const restriction = await checker.whatCanRead(req, res);
    const measurements = await 
    manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Measurement, restriction); 
    console.log(measurements)
    
    const measurements = await Measurement.paginate(filter);
    const outliers = await find(measurements.docs.map(x => ({ id:x.id, value:x.samples[0].vlues[0][0] })), computation);
    for(let i=0; i<outliers.length; i++) 
        await Measurement.findByIdAndUpdate(outliers[i].id, { $push: { tags: "outlier" } });
    console.log(runner);
    runner.complete(computation);
}

const find = async function(arr, computation) {
  arr = arr.sort(function(a, b) { return a.value - b.value; });
  const middle = median(arr);
  const range = iqr(arr);
  const outliers = [];
  let index = 1;
  for (let i = 0; i < arr.length; i++) {
    await sleep(3000); // just to simulate a long process
    if(index > arr.length/100) {
        runner.progress(computation, ((i+1)/arr.length)*100);
        index=0;
    }
    index++;
    if(Math.abs(arr[i].value - middle) > range) 
        outliers.push(arr[i]);
  }
  return outliers;
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function median(arr) {
    const len = arr.length;
    const half = ~~(len / 2);
    return len % 2 ? arr[half].value : (arr[half - 1].value + arr[half].value) / 2;
}

function iqr(arr) {
  const len = arr.length;
  const q1 = median(arr.slice(0, ~~(len / 2)));
  const q3 = median(arr.slice(Math.ceil(len / 2)));
  const g = 1.5;
  return (q3 - q1) * g;
}

