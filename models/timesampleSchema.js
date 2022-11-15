const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
mongoose.Promise = global.Promise;
const inspector = require("../commons/inspector.js");
const cache = require("../commons/cache.js");

const timesampleSchema = new mongoose.Schema(
  {
    values: { type: [Object], required: true },
    measurement: { type: String, ref: 'Measurement', required: true },
    timestamp: { type: Date,  required: "Please, supply a timestamp" }
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'measurement',
      granularity: 'seconds',
    }
  }
);

timesampleSchema.set("toJSON", { versionKey: false });
timesampleSchema.plugin(paginate);
timesampleSchema.plugin(require("mongoose-autopopulate"));

// validate measurement
timesampleSchema.path("measurement").validate({
  validator: async function (value) {
    if (cache.get(value+"_measurement")) return true;
    const Measurement = this.constructor.model("Measurement");
    const measurement = await Measurement.findById(value).populate('feature');
    if (!measurement) throw new Error("Measurement not existent (" + value + ")");
    cache.set(value+"_measurement", measurement);
    return true;
  }
});

// check consistency between values and feature
timesampleSchema.pre("save", async function () {
  let measurement = cache.get(this.measurement+"_measurement");
  if (!measurement) {
    const Measurement = this.constructor.model("Measurement");
    measurement = await Measurement.findById(this.measurement).populate('feature');
    console.log(measurement)
    cache.set(this.measurement+"_measurement", measurement);
  }
  let result = inspector.areCoherent(this, measurement.feature);
  if (result != true) throw new Error(result);
});

module.exports = timesampleSchema;
