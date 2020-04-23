const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

mongoose.Promise = global.Promise; 

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const sleep = function(ms){
    return new Promise(resolve=>{
        setTimeout(resolve, ms)
    })
}

const connection = async function(){
    let go = false;
    let uri = null;
    if(process.env.ENV === "test") {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = new MongoMemoryServer();
        uri = await mongod.getUri();
    }
    else uri = process.env.DATABASE

    while(!go) {
        try { 
            await mongoose.connect(uri); 
            console.error('Database connected!')
            go = true;
        } 
        catch (error) { 
            console.error('Database connection error, retry in 3 secs...'); 
            await sleep(3000);
        }
    } 
}
connection();

mongoosePaginate.paginate.options = { lean: false };

require('./models/fieldmaskSchema');
require('./models/userSchema');
require('./models/tagSchema');
require('./models/logSchema');
require('./models/scriptSchema');
require('./models/featureSchema');
require('./models/thingSchema');
require('./models/deviceSchema');
require('./models/issueSchema');
require('./models/rightSchema');
require('./models/measurementSchema');
require('./models/errorSchema');
require('./models/computationSchema');
require('./models/constraintSchema');
require('./models/passwordResetSchema');
