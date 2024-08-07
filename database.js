const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');     
const factory = require('./commons/factory.js');
const tenancy = require('./commons/tenancy.js');

mongoose.Promise = global.Promise; 

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoosePaginate.paginate.options = { lean: false };
mongoose.dbs = [];

const sleep = function(ms){ return new Promise(resolve=>{ setTimeout(resolve, ms) }) };

exports.init = async function(mode){
    let go = false;
    let uri = null;
    
    // Select MongoDb server (in memory version of testing)
    if(mode === "test") {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
    }
    else {
        if (process.argv.includes('docker')) process.env.DATABASE = process.env.DATABASE.replace('localhost', 'database');
        uri = process.env.DATABASE;
    }

    // Connect to tenants catalogue database
    while(!go) {
        try {             
            mongoose.dbs['catalog'] = await mongoose.createConnection(uri); 
            const tenderSchema = require('./models/tenantSchema.js');
            mongoose.dbs['catalog'].model('Tenant', tenderSchema);
            console.error('Database connected!');
            go = true;
        } 
        catch (error) { 
            console.error('Database connection error, retry in 3 secs... (' + error + ')'); 
            await sleep(3000);
        }
    } 

    // Init tenants
    const tenants = await tenancy.getList();
    if(tenants.length < 1) { 
        console.error('Database initialization error, missing default tenants'); 
        process.exit();
    }
    for(let i=0; i<tenants.length; i++) { 
        await tenancy.init(tenants[i]); 
    }

    console.error('Database ready!');
} 
