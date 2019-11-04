const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

mongoose.Promise = global.Promise; 

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

if(process.env.ENV === "test") {
    const Mockgoose = new require('mockgoose').Mockgoose;
    const mockgoose = new Mockgoose(mongoose);
    mockgoose.prepareStorage().then(function() { mongoose.connect(process.env.DATABASE); });
}
else { mongoose.connect(process.env.DATABASE); }

mongoose.connection.on('error', (err) => { console.error('Database connection error '+ err.message); });

mongoosePaginate.paginate.options = { lean: false };

require('./models/userSchema');
require('./models/tagSchema');
require('./models/logSchema');
require('./models/scriptSchema');
require('./models/featureSchema');
require('./models/thingSchema');
require('./models/deviceSchema');
require('./models/measurementSchema');
require('./models/errorSchema');
require('./models/computationSchema');
require('./models/constraintSchema');
require('./models/rightSchema');
