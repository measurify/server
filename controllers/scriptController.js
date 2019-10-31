const mongoose = require('mongoose');
const manager = require('./manager');
const checker = require('./checker');
const Script = mongoose.model('Script');
const Device = mongoose.model('Device');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { 
    return await manager.getResourceList(req, res, '{ "timestamp": "desc" }', '{}', Script); 
};

exports.getone = async (req, res) => { 
    return await manager.getResource(req, res, null, Script); 
};

exports.post = async (req, res) => {
    return await manager.postResource(req, res, Script);
};

exports.delete = async (req, res) => {
    let result = await checker.isAvailable(req, res, Script); if (result != true) return result;
    result = await checker.isOwned(req, res); if (result != true) return result;
    result = await checker.isNotUsed(req, res, Device, 'scripts'); if (result != true) return result;
    return await manager.deleteResource(req, res, Script);
};

exports.put = async (req, res) => { 
    try {
        if(!req.body.code && !req.body.tags) return res.status(errors.script_missing_info.status).json(errors.script_missing_info);
        const script = await Script.findById(req.params.id);
        if(!script) return res.status(errors.script_not_found.status).json(errors.script_not_found);
        if (!Authorization.isOwner(req.user, script)) return errors.manage(res, errors.script_cannot_be_modify_from_not_owner, req.params.id);
        if(req.body.code) script.code = req.body.code;
        if(req.body.tags) await manager.modifyTagList(script, req.body.tags);
        script.lastmod = Date.now();
        const modified_script = await Script.findOneAndUpdate({_id: script.id}, script, { new: true });
        return res.status(200).json(modified_script);
    }  
    catch (err) { return errors.manage(res, errors.script_put_request_error, err); }
}
