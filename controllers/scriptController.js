const mongoose = require('mongoose');
const manager = require('./manager');
const Script = mongoose.model('Script');
const Device = mongoose.model('Device');
const Tag = mongoose.model('Tag');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');

exports.get = async (req, res) => { return await manager.getResourceList(res, req, '{ "timestamp": "desc" }', '{}', Script); };

exports.getone = async (req, res) => {
    const script = await Script.findById(req.params.id);
    if (script) return res.status(200).json(script);
    else return errors.manage(res, errors.script_not_found, req.params.id);
};

exports.post = async (req, res) => {
    if (req.body.constructor == Array) return await manager.postResourceList(req, res, Script);
    return await manager.postResource(req, res, Script);
};

exports.delete = async (req, res) => {
    const script = await Script.findById(req.params.id);
    if(!script) return errors.manage(res, errors.script_not_found, req.params.id); 
    if (!Authorization.isOwner(req.user, script)) return errors.manage(res, errors.script_cannot_be_deleted_from_not_owner, req.params.id);
    const device = await Device.find({ scripts: req.params.id }).limit(1);
    if (device.length != 0) return errors.manage(res, errors.script_cannot_be_deleted_with_devices, device); 
    const result = await Script.deleteOne({ _id: req.params.id });
    if (!result) return errors.manage(res, errors.script_not_found, req.params.id);
    else return res.status(200).json(script);
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
