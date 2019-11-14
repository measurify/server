const mongoose = require('mongoose');
const persistence = require('../commons/persistence');
const authorization = require('../security/authorization');
const Measurement = mongoose.model('Measurement');

function Buncher(computation, runner, page_size) {
    this.page_size = page_size;
    this.computation = computation;
    this.runner = runner;
    this.page = 0;
    this.pages = 0;
    this.restriction = null;
    this.size = 0
    this.index = 1;

    this.init = async function() {
        this.restriction = await authorization.whatCanRead(this.computation.owner);
        this.size = await persistence.getSize(this.computation.filter, this.restriction, Measurement);
        this.pages = Math.ceil(this.size / this.page_size);
    }

    this.next = async function() {
        if(this.index > this.pages) return null;
        const measurements = await persistence.getList(this.computation.filter, null, null, this.index, this.page_size, this.restriction, Measurement);
        runner.progress(this.computation, ((this.index+1)/this.pages)*100);
        this.index++;
        return measurements;
    }
};

module.exports = Buncher;
