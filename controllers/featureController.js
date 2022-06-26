const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

const persistence = require('../commons/persistence.js');

exports.get = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Feature);
    const restrictions = { ...restriction_1, ...restriction_2 };
    return await controller.getResourceList(req, res, '{ "timestamp": "desc" }', select, Feature, restrictions);
};

exports.pipe = async (req, res) => {
    const select = await checker.whatCanSee(req, res, Feature)
    const restriction_1 = await checker.whatCanRead(req, res);
    const restriction_2 = await checker.whichRights(req, res, Feature);
    const restrictions = { ...restriction_1, ...restriction_2 };
    controller.getResourcePipe(req, res, '{ "timestamp": "desc" }', select, Feature, restrictions);
};

exports.getone = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature)
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    return await controller.getResource(req, res, null, Feature, select);
};

exports.post = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    let result = await checker.canCreate(req, res); if (result != true) return result;
    result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;
    return await controller.postResource(req, res, Feature);
};

exports.put = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const fields = ['tags', '_id'];
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.isFilled(req, res, fields); if (result != true) return result;
    result = await checker.canModify(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    if (req.body._id != null) {
        /*Questo NON funziona perchè la getone di qui chiude la chiamata inviando i dati a postman e ho finito, non posso inviare altre risposte
        req.params.id=req.resource._id;
        const risorsa=await this.getone(req,res);
        console.log(risorsa);
        */

        /*Questo NON funziona perchè la getResource di qui chiude la chiamata inviando i dati a postman e ho finito, non posso inviare altre risposte
        //allo stesso modo della chiamata di sopra quindi in controller la funzione return res.status(200).json(item); prepara l'invio e invia i dati quindi dobbiamo evitarla
        const Feature = mongoose.dbs[req.tenant.database].model('Feature');
        const select = await checker.whatCanSee(req, res, Feature)
        let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
        result = await checker.canRead(req, res); if (result != true) return result;
        result = await checker.hasRights(req, res, Feature); if (result != true) return result;
        req.params.id=req.resource._id;
        const risorsa= await controller.getResource(req, res, null, Feature, select);
        console.log(risorsa); 
        */


        //controllo che la get, post e delete vadano abbiano tutti i permessi e poi le eseguo in successione

        //post in feature controller
        const Feature = mongoose.dbs[req.tenant.database].model('Feature');
        let result = await checker.canCreate(req, res); if (result != true) return result;
        result = await checker.hasRightsToCreate(req, res, ['tags']); if (result != true) return result;

        //delete in feature controller //is avaible in the third line of put
        const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
        const Device = mongoose.dbs[req.tenant.database].model('Device');
        //const Feature = mongoose.dbs[req.tenant.database].model('Feature');
        //result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
        result = await checker.isOwned(req, res); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Measurement, 'feature'); if (result != true) return result;
        result = await checker.isNotUsed(req, res, Device, 'features'); if (result != true) return result;
        //result = await checker.hasRights(req, res, Feature); if (result != true) return result;

        //prepare id for the delete
        req.params.id = req.resource._id;

        //prepare getone from feature controller
        const select = await checker.whatCanSee(req, res, Feature);
        //result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
        result = await checker.canRead(req, res); if (result != true) return result;
        //result = await checker.hasRights(req, res, Feature); if (result != true) return result;

        //get resource in controller get
        const oldFeature = await persistence.get(req.params.id, null, Feature, select);
        if (!oldFeature) return errors.manage(res, errors.resource_not_found, req.params.id);

        //prepare newfeature body for the post
        let newFeature = oldFeature._doc;
        newFeature._id = req.body._id;
        newFeature.owner = req.user._id;

        //post in controller
        const resultPost = await persistence.post(newFeature, Feature, req.tenant);
        if (!!resultPost.errors) return errors.manage(res, errors.post_request_error, resultPost);

        //delete in controller
        try {
            const resultDelete = await persistence.delete(req.params.id, Feature);
            if (!resultDelete) return errors.manage(res, errors.resource_not_found, req.params.id);
        }
        catch (err) {
            if (err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
            else return errors.manage(res, errors.delete_request_error, err);
        }
        //se arriva fino a qua significa che il cambio della risorsa ha funzionato
        console.log("cambio _id effettuato");
    }
    return await controller.updateResource(req, res, fields, Feature);
};

exports.delete = async (req, res) => {
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Measurement, 'feature'); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'features'); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    return await controller.deleteResource(req, res, Feature);
};
