const ClinicDoctor = require('@nearform/doctor')
const doctor = new ClinicDoctor()
 
doctor.collect(['node', 'api.js'], function (err, filepath) {
  if (err) throw err
 
  doctor.visualize(filepath, filepath + '.html', function (err) {
    if (err) throw err
  });
})