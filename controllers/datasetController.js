const mongoose = require('mongoose');
const controller = require('./controller');
const checker = require('./checker');
const Authorization = require('../security/authorization.js');
const errors = require('../commons/errors.js');
const busboy = require('connect-busboy');
const persistence = require('../commons/persistence.js');
const { result } = require('underscore');
const { file } = require('../types/itemTypes');
const VisibilityTypes = require('../types/visibilityTypes.js');
const { catchErrors } = require('../commons/errorHandlers.js');
const datauploadController = require('../controllers/datauploadController.js');
const datasetCreator = require('../commons/datasetCreator.js');

exports.get = async (req, res) => {
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const select = await checker.whatCanSee(req, res, Feature)
    let result = await checker.isAvailable(req, res, Feature); if (result != true) return result;
    result = await checker.canRead(req, res); if (result != true) return result;
    result = await checker.hasRights(req, res, Feature); if (result != true) return result;
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');
    return await controller.getResourceDataset(req, res, '{ "timestamp": "desc" }', select, Measurement);
};

exports.post = async (req, res, next, fileData, descriptionData, filename) => {
    const Dataupload = mongoose.dbs[req.tenant.database].model('Dataupload');
    const Feature = mongoose.dbs[req.tenant.database].model('Feature');
    const Device = mongoose.dbs[req.tenant.database].model('Device');
    const Thing = mongoose.dbs[req.tenant.database].model('Thing');
    const Tag = mongoose.dbs[req.tenant.database].model('Tag');
    const Measurement = mongoose.dbs[req.tenant.database].model('Measurement');    

    let result =await datasetCreator.datauploadCheckAndCreate(req,res,descriptionData,filename,fileData);if (result != true) return result;

    result=await datasetCreator.createTag(req,res,filename);if (result != true) return result;

   
    /*
    //datauploads check

    //check rights
    result = await checker.canCreate(req, res); if (result != true) return errors.manage(res, errors.restricted_access_create);
    result = await checker.hasRightsToCreate(req, res, ['thing', 'device', 'feature', 'tags']); if (result != true) return errors.manage(res, errors.restricted_access_create);
    //check if feature exists
    let feature = await Feature.findById(req.params.id);//utile per le parti successive
    if (!feature) {//error feature not found 
        console.log("feature doesn't exist");
        return errors.manage(res, errors.feature_not_found, req.params.id);
    }
    //console.log(feature);
    console.log("check1")

    //check if feature has the same number of items
    //first try to convert descriptionData to json
    try {//descriptionData must be json readable
        descriptionData = JSON.parse(descriptionData);
        console.log("si lo è");

    } catch (error) {
        console.log("non lo è");
        return errors.manage(res, errors.description_not_json);
    }
    //check if feature has the same number of items 
    itemsNumber = descriptionData.items.length;
    const item = await persistence.get(req.params.id, null, Feature, null);
    if (itemsNumber != item.items.length) {
        console.log("errore elementi nella feature in numero diverso");
        return errors.manage(res, errors.feature_different, itemsNumber + " != " + item.items.length);
    }

    //check if exist dataupload with the same id (the id is the filename)
    result = await this.checkerIfExist(Dataupload, filename);
    if (result) {
        console.log("already exist a dataupload with the same id, can't save two datafile with the same name");
        return errors.manage(res, errors.already_exist_dataupload, filename);
    }

    console.log("check 2")
    //createdataupload ricorda che poi results va aggiornato alla fine del processo,
    //await this.createDataupload(filename,req.user,Date.now,fileData.length,null,Date.now);
    req.body = await this.createDatauploadRequest(filename, req.user._id, Date.now(), fileData.length, null, Date.now());
    //console.log(req.body);
    try {
        const results = await persistence.post(req.body, Dataupload, req.tenant);
        console.log("ciccio");
        console.log(results);
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }


    //create tag {id} 
    //check if it already exists
    const tagDataupload = filename;
    console.log(tagDataupload);
    result = await this.checkerIfExist(Tag, tagDataupload);
    if (!result) {
        try {
            bodyTag = await this.createTagRequest(tagDataupload);
            const results = await persistence.post(bodyTag, Tag, req.tenant);
            console.log(results);
        }
        catch (err) { return errors.manage(res, errors.post_request_error, err); }
    }
    console.log("check3");
    */

    //create report
    //const itemsName = Measurement.modelName.toLowerCase() + 's';
    const report = { completed: [], errors: [] };
    descriptionData = JSON.parse(descriptionData);
    let feature = await Feature.findById(req.params.id);
    //error //report.errors.push('Index: ' + i +  ' (' + err.message + ')');

    //csv unrolling and control
    //control number of element in the description    

    const elementsNumber = await elementsCount(descriptionData);
    //console.log(elementsNumber);

    //prepare an object semplified for next steps ATTENZIONE BISOGNA FARE CONTROLLO CHE CI SIANO TUTTE LE COSE CHE CI INTERESSANO ALL'INTERNO DI DESCRIPTIONDATA SENNò ERRORE (SOLO ENDDATE FACOLTATIVA)
    const descriptionDataCleaned = await cleanObj(descriptionData);
    //console.log(descriptionDataCleaned); 

    fileDataModified = fileData.replace(/(\r)/gm, "");
    //fileDataModified = fileDataModified.replace("\"", "");
    //console.log(fileDataModified);
    var lines = fileDataModified.split("\n");
    console.log("check4");

    //OLD
    //resultThing=  await this.checkerIfExist(Thing,"shop");
    //console.log("result:");
    //console.log(resultThing);

    //funziona ma è bruttissimo 
    /*
    for(i=0;i<lines.length;i++){
        line=lines[i].split(",");
        console.log(line);
        id=line[descriptionDataCleaned.thing]
        id=id.replaceAll(/['"]+/g, '');
        console.log(id);
        //let rese = await Thing.findOne( { _id: id });
        let rese = await this.checkerIfExist(Thing,id);
        console.log(rese);
        console.log("eccoqui");
    }
    */

    /*
    lines.forEach(async element => { 
        line=element.split(",");
        console.log(line);
        id=line[descriptionDataCleaned.thing]
        id=id.replaceAll(/['"]+/g, '');
        console.log(id);
        //let rese = await Thing.findOne( { _id: id });
        let rese = await this.checkerIfExist(Thing,id);
        console.log(rese);
        console.log("eccoqui");
    });
    */

    /*
    lines.map(async element => { 
        line=element.split(",");
        console.log(line);
        id=line[descriptionDataCleaned.thing]
        id=id.replaceAll(/['"]+/g, '');
        console.log(id);
        //let rese = await Thing.findOne( { _id: id });
        let rese = await this.checkerIfExist(Thing,id);
        console.log(rese);
        console.log("eccoqui");
    });
    */

    /*
    lines.forEach(async() => { let rese = await Thing.findOne( { _id: "ciccio" });
        console.log(rese);
    console.log("ecco")});
    */

    //algorithm for check every line of the csv and save the value inside a measurement
    principalLoop:
    for (let i in lines) {
        line = lines[i].split(",");
        if (line.length != elementsNumber) {
            console.log("errore non ci sono abbastanza campi nella riga");
            errMessage = "not enough fields in the row"
            report.errors.push('Index: ' + i + ' (' + errMessage + ')');
            continue principalLoop;
        }
        //console.log(line);

        //check if exist thing with the same id 
        thing = line[descriptionDataCleaned.thing].replaceAll(/['"]+/g, '');
        //id=id.replaceAll(/['"]+/g, '');
        //console.log(id);

        //OLD
        //let rese = await Thing.findOne( { _id: id });
        let resultThing = await this.checkerIfExist(Thing, thing);
        //console.log(resultThing);
        //console.log("eccoqui");
        //CHECK HERE
        if (!resultThing) {
            console.log("errore la thing " + thing + " non esiste");
            errMessage = "thing " + thing + " not found in database"
            report.errors.push('Index: ' + i + ' (' + errMessage + ')');
            continue principalLoop;
        }

        //check if exist thing with the same id 
        device = line[descriptionDataCleaned.device].replaceAll(/['"]+/g, '');
        //console.log(id);
        resultDevice = await this.checkerIfExist(Device, device);
        //console.log(resultDevice);
        //console.log("eccoqui2");
        //CHECK HERE
        if (!resultDevice) {
            console.log("errore il device " + device + " non esiste");
            errMessage = "device " + device + " not found in database"
            report.errors.push('Index: ' + i + ' (' + errMessage + ')');
            continue principalLoop;
        }

        //check if startdate is a date
        let result = Date.parse(line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, ''));//need to remove ""
        console.log(result);
        if (Number.isNaN(result)) {
            console.log("la startdate " + result + " non è in formato date");
            errMessage = "startdate is not in Date format"
            report.errors.push('Index: ' + i + ' (' + errMessage + ')');
            continue principalLoop;
        }
        startdate = line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, '');

        //check if enddate exist and is a date ATTENZIONE MANCA SE NON C'é UNA COLONNA MAPPATA
        let enddate = "";
        result = Date.parse(line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, ''));//need to remove ""
        if (line[descriptionDataCleaned.enddate] == "") {
            enddate = line[descriptionDataCleaned.startdate].replaceAll(/['"]+/g, '');
        }
        else {
            enddate = line[descriptionDataCleaned.enddate].replaceAll(/['"]+/g, '');
            if (Number.isNaN(result)) {
                console.log("la enddate " + result + " non è in formato date");
                errMessage = "enddate is not in Date format"
                report.errors.push('Index: ' + i + ' (' + errMessage + ')');
                continue principalLoop;
            }
        }

        //check if exist tags with the same id 
        //console.log(descriptionDataCleaned.tags);
        //var tagsNumber=descriptionDataCleaned.tags;
        var tags = [];
        for (let j in descriptionDataCleaned.tags) {
            id = line[descriptionDataCleaned.tags[j]].replaceAll(/['"]+/g, '');
            //console.log(id);
            resultTag = await this.checkerIfExist(Tag, id);

            //console.log(resultTag);
            //console.log("eccoqui2");
            //CHECK HERE
            if (!resultTag) {
                console.log("errore il tag " + id + " non esiste");
                errMessage = "tag " + id + " not found in database"
                report.errors.push('Index: ' + i + ' (' + errMessage + ')');
                continue principalLoop;
            }
            tags.push(id);
        }
        //Add datauploadtag
        tags.push(filename);


        var samples = [];
        for (let k in descriptionDataCleaned.items) {
            id = line[descriptionDataCleaned.items[k]].replaceAll(/['"]+/g, '');
            //console.log(id);
            //console.log(feature.items[k].type);
            if (feature.items[k].type == "number") {
                if (isNaN(id)) {//not a number
                    console.log("errore aspettato numero alla posizione " + k);
                    errMessage = "expected number in samples at position " + k;
                    report.errors.push('Index: ' + i + ' (' + errMessage + ')');
                    continue principalLoop;
                }
            }
            else if (feature.items[k].type == "string") {
                if (typeof myVar != 'string') {
                    console.log("errore aspettata stringa alla posizione " + k);
                    errMessage = "expected string in samples at position " + k;
                    report.errors.push('Index: ' + i + ' (' + errMessage + ')');
                    continue principalLoop;
                }
            }
            else {
                console.log("errore nella definizione dei parametri nella feature");
                errMessage = "error in the definition of the feature on the database, value.type is not a number or string";
                report.errors.push('Index: ' + i + ' (' + errMessage + ')');
                continue principalLoop;
            }

            samples.push(id);

            //console.log(id);
            //console.log(this.createSamples(id,0));
            //feature.items[k];
        }
        //console.log(samples);
        samples = this.createSamples(samples, 0);
        //console.log(samples);

        //se arriva fin qui allora va tutto bene e posso salvarla
        console.log(req.user._id);
        console.log(feature._id);
        console.log(device);
        console.log(thing);
        console.log(tags);
        console.log(samples);
        console.log(startdate);
        console.log(enddate);
        console.log(req.tenant);


        report.completed.push('Index: ' + i);




        //create measurement
        //this.createMeasurement(req.user,feature._id,device,thing,tags,samples,startdate,enddate,null,VisibilityTypes.private,req.tenant);
        body = createBody(startdate, enddate, thing, feature._id, device, samples, tags, req.user._id);
        /*
        const results = await persistence.post(body, Measurement, req.tenant);
        //req.result = results;   
        if (req.body.constructor != Array) return res.status(200).json(results);
        else {
            if (req.query.verbose == 'true') {
                if (results.errors.length === 0) { return res.status(200).json(results); }
                else { return res.status(202).json(results); }
            }
            else {
                const items = model.modelName.toLowerCase() + 's';
                if (results.errors.length === 0) { return res.status(200).json({ saved: results[items].length, errors: results.errors.length }); }
                else { return res.status(202).json({ saved: results[items].length, errors: results.errors.length, Indexes: results.errors }); }
            }
        }*/
    }
    console.log(report);
    /*       
    lines.map((value)=>{
        line=value.split(",");
        if(line.length!=elementsNumber){console.log("errore non ci sono abbastanza campi nella riga");}
        //console.log(descriptionDataCleaned.thing);
        //console.log(line[descriptionDataCleaned.thing]);
        //check if exist thing with the same id 
        resultThing=  this.checkerIfExist(Thing,line[descriptionDataCleaned.thing]);
        resultDevice= this.checkerIfExist(Device,line[descriptionDataCleaned.device]);
        //check if startdate is a date
        let result=Date.parse(line[descriptionDataCleaned.startdate].replaceAll("\"",""));
        if(Number.isNaN(result)){console.log("la startdate non è in formato date")}
        //check if enddate exist and is a date
        let enddate="";
        if(line[descriptionDataCleaned.enddate]==""){
            enddate=line[descriptionDataCleaned.startdate];
        }
        else {
            result=Date.parse(line[descriptionDataCleaned.enddate].replaceAll("\"",""));            
            if(Number.isNaN(result)){console.log("la enddate non è in formato date")}
        }
        console.log(resultThing);
        if(!resultThing){console.log("la thing non esiste prima crearla")}
        console.log(resultDevice);
        if(!resultDevice){console.log("il device non esiste prima crearla")}
        
    })
    */






    return await controller.postResourceDataset(req, res, Measurement, descriptionData);
};

exports.createDatauploadRequest = async function (filename, owner, timestamp, size, results, lastmod) {
    var results = {
        "_id": filename,
        "owner": owner,
        "timestamp": timestamp,
        "size": size,
        "results": results,
        "lastmod": lastmod
    };
    //results = JSON.stringify(results);
    console.log(results);
    return results;
    /*old
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Dataupload = mongoose.dbs[tenant.database].model('Dataupload');
    const req = {
        _id: filename,
        owner: owner,
        timestamp: timestamp || Date.now(),
        size: size,
        results: results,
        lastmod: lastmod || Date.now(),
    }
    const dataupload = new Dataupload(req);
    await dataupload.save();
    return dataupload._doc;
    */
};

exports.createTagRequest = async function (tagName) {
    var results = {
        "_id": tagName
    };
    console.log(results);
    return results;
};

exports.checkerIfExist = async function (model, id) {//if something already exists
    let result = await model.exists({ _id: id });
    console.log(result);
    return result;
    //const result = await model.exists({ _id: id });
    //if (result)  return true;//already exist with that id
    //return false; //not exist           
};

exports.createTag = async function (name, owner, tags, visibility, tenant) {
    const Tenant = mongoose.dbs['catalog'].model('Tenant');
    if (!tenant) tenant = await Tenant.findById(process.env.DEFAULT_TENANT);
    const Tag = mongoose.dbs[tenant.database].model('Tag');
    let tag = await Tag.findOne({ _id: name });
    if (!tag) {
        const req = { _id: name, owner: owner, tags: tags, visibility: visibility }
        tag = new Tag(req);
        await tag.save();
    }
    return tag._doc;
};

exports.createSamples = function (value, delta) {
    if (Array.isArray(value)) return [{ values: value, delta: delta }]
    else return [{ values: [value], delta: delta }]
}

const elementsCount = async function (descriptionData) {
    var elementsNumber = 0;
    for (var key in descriptionData) {
        if (key == "items") {
            elementsNumber += descriptionData.items.length;
        }
        else {
            if (key == "tags") {
                elementsNumber += descriptionData.tags.length;

            } else elementsNumber++;
        }
    }
    return elementsNumber;
}

const cleanObj = async function (descriptionData) {//cleaned c and -1 for each row to semplify next steps
    data = descriptionData;
    for (var key in descriptionData) {
        if (key == "items") {
            for (var element in descriptionData.items)
                data.items[element] = parseInt(descriptionData.items[element].replace("c", "")) - 1;
        }
        else {
            if (key == "tags") {
                for (var element in descriptionData.tags)
                    data.tags[element] = parseInt(descriptionData.tags[element].replace("c", "")) - 1;

            } else data[key] = parseInt(descriptionData[key].replace("c", "")) - 1;
        }
    }
    return data;
}

const createBody = async function (startdate, enddate, thing, feature, device, samples, tags, owner) {
    var results = {
        "startDate": startdate,
        "endDate": enddate,
        "thing": thing,
        "feature": feature,
        "device": device,
        "samples": samples,
        "tags": tags,
        "owner": owner
    };
    console.log(results);
    return results;
}