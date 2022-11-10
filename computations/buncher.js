const mongoose = require('mongoose');
const persistence = require('../commons/persistence');
const authorization = require('../security/authorization');

function Buncher(computation, user, runner, page_size, tenant) {
    this.page_size = page_size;
    this.computation = computation;
    this.user = user;
    this.runner = runner;
    this.page = 1;
    this.pages = 0;
    this.restriction = null;
    this.size = 0

    const Measurement = mongoose.dbs[tenant.database].model('Measurement');
    
    this.init = async function() {
        const Role = mongoose.dbs[tenant.database].model('Role');
        const role = await Role.findById(this.user.type);
        //this.restriction = await authorization.whatCanRead(this.user);        
        this.restriction = await authorization.whatCanOperate(this.user,role,"GET","Measurement");
        this.size = await persistence.getSize(this.computation.filter, this.restriction, Measurement);
        this.pages = Math.ceil(this.size / this.page_size);
    }

    this.next = async function() {
        if(this.page > this.pages) return null;
        const measurements = await persistence.getList(this.computation.filter, null, null, this.page, this.page_size, this.restriction, Measurement);
        runner.progress(this.computation, ((this.page)/this.pages)*100, tenant);
        this.page++;
        return measurements;
    }
};

module.exports = Buncher;
