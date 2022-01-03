
const mongoose = require('mongoose');
const persistence = require('../commons/persistence.js');
const errors = require('../commons/errors.js');
const { isArray, forEach, isObject } = require('underscore');

exports.getResource = async function(req, res, field, model, select) {
    try {
        const item = await persistence.get(req.params.id, field, model, select);
        if(!item) return errors.manage(res, errors.resource_not_found, req.params.id);
        return res.status(200).json(item);
    } 
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err); 
    }
};

exports.getResourceDataset = async function(req, res, sort, select, model) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        if (!query.filter) query.filter = '{}';//Create here filter + id
        filterDataset = prepareFilterDataset(req.params.id,query.filter);
        if(!filterDataset)return errors.manage(res, errors.different_feature);
        if(req.headers.accept == 'text/csv') {
            restriction={};
            filterDataset=JSON.stringify(filterDataset);//need to be a string not an object
            let list = await persistence.getList(filterDataset, query.sort, select, query.page, query.limit, restriction, model);
        
            res.header('Content-Type', 'text/csv');
            let csvresultlibrary = '';
            
            csvresultlibrary=jsonToCSV(list);            
            console.error("csvresultlibrary vale: ");
            console.error(csvresultlibrary);
                        
            return res.status(200).json(csvresultlibrary);           
        }
        else if(req.headers.accept == 'text/csv+'){
            restriction={};            
            filterDataset=JSON.stringify(filterDataset);//need to be a string not an object
            const Feature = mongoose.dbs[req.tenant.database].model('Feature');
            const item = await persistence.get(req.params.id, null, Feature, select);            
            let list = await persistence.getList(filterDataset, query.sort, select, query.page, query.limit, restriction, model);
        
            res.header('Content-Type', 'text/csv');
                       
            let columnsName=[];
            item.items.forEach(elem=>columnsName.push(elem.name));
            let tocsvresult = '';
            tocsvresult=jsonToCSVPlus(list,columnsName);
            console.error("tocsvresult vale: ");
            console.error(tocsvresult);
            
            return res.status(200).json(tocsvresult);           
        }//else no accept headers parameters or else
        let list = await persistence.getDataset(filterDataset, query.sort, select, query.page, query.limit, model);
        return res.status(200).json(list);
    } 
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.get_request_error, err); 
    }
};


exports.getResourcePipe = function(req, res, sort, select, model, restriction) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        persistence.getPipe(req, res, query.filter, query.sort, select, restriction, model )
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.getResourceList = async function(req, res, sort, select, model, restriction) {
    try {
        const query = req.query;
        if (!query.sort) query.sort = sort;
        let list = await persistence.getList(query.filter, query.sort, select, query.page, query.limit, restriction, model);
        console.error(list);
        if(req.headers.accept == 'text/csv') {
            res.header('Content-Type', 'text/csv');
            csvresultlibrary=jsonToCSV(list);            
            console.error("csvresultlibrary vale: ");
            console.error(csvresultlibrary);
            
            return res.status(200).json(csvresultlibrary);           
        }
        else return res.status(200).json(list);
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

const jsonToCSVPlus=function(jsonData,columnsname) {
    jsonData=JSON.stringify(jsonData);
    //console.log(jsonData);
    const json =
      typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
      columnsname=columnsname.map(x=>`"${x}"`).join(",");
    
    let str =
      `${Object.keys(json.docs[0])//parte per mettere l'intestazione del csv con i nomi delle colonne
        .map((value) => {
            if(value=="samples"){
                return columnsname;
            }
            else return`"${value}"`})
        .join(",")}` + ",\"deltatime\""+"\r\n";
    currentRow="\r\n";//stringa virtuale usata per i samples con piu value.
        json.docs.forEach(doc=>{//compilazione campi riga per riga
    str +=//entriamo per un doc ossia un singolo samples del json
        `${Object.values(doc)//questo divide ogni singolo campo del samples, cicla per visility,tags ecc
          .map((value) => {
                if(isArray(value) )//nel caso in cui sia tags o samples entra qui
                {                   
                    if(value.length==0){//se il tags o samples non contiene valori metto un array vuoto
                        currentRow+=`"[]"`+",";
                        return `"[]"`;
                    }
                    if(isObject(value[0])){                        
                        return value.map((x)=>
                            {    
                                delta=0;//inizializzazione e nel caso nullo
                                if(x.delta!=null)delta=x.delta;  //lo aggiungo come colonna                            
                                // se nei samples è un insieme di oggetti contenenti values entra qui dentro
                                return x.values.map(x=>`"${x}"`).join(",")+",\""+delta+"\"";//mappa i valori di values separandoli con una virgola. 
                            }
                        ).join(currentRow);}
                    else{ 
                        currentRow+="["+value+"]"+",";
                        return "["+value+"]";}//se è il tags ritorna il valore e basta
                } 
                else {currentRow+=`"${value}"`+",";
                    return `"${value}"`}}).join(",")}` + "\r\n";
                    currentRow="\r\n";});//se non è un array aggiunge semplicemente il valore alla stringa
    return str;   
}

const jsonToCSV=function(jsonData) {
    jsonData=JSON.stringify(jsonData);
    const json =
        typeof jsonData !== "object" ? JSON.parse(jsonData) : jsonData;
    const { Parser, transforms: { unwind,flatten } } = require('json2csv');

    const fields = ["visibility","tags","_id","startDate","endDate","thing","feature","device",'samples.values'];
    //const transforms = [unwind({ paths: ['samples','samples.values'] }),flatten({ objects: true, arrays:true })];//questo nel caso avessimo piu seamples lo apre  paths: ['samples','samples.values'] per separare ogni riga ma non va bene
    //const transforms = [unwind({ paths: ['samples'] }),flatten({objects:false,arrays:false,separator:"_"})];
    const transforms = [unwind({ paths: ['samples'] })];

    const json2csvParser = new Parser({fields, transforms});
    const csv = json2csvParser.parse(json.docs);
    return csv;      
}

exports.getResourceListSize = async function(req, res, model, restriction) {
    try {
        const query = req.query;
        const size = await persistence.getSize(query.filter, restriction, model);
        return res.status(200).json({size: size});
    }
    catch (err) { return errors.manage(res, errors.get_request_error, err); }
}

exports.streamResource = async function(req, data, model) {
    try { 
        data = JSON.parse(data);
        if(req.user._id) data.owner = req.user._id;
        return await persistence.post(data, model, req.tenant);
    }
    catch (err) { return err; }
}

exports.postResource = async function(req, res, model) {
    try { 
        if(req.user._id) req.body.owner = req.user._id;
        if(!req.query.verbose) req.query.verbose = 'true';
        const results = await persistence.post(req.body, model, req.tenant);
        req.result = results;   
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
        }
    }
    catch (err) { return errors.manage(res, errors.post_request_error, err); }
}

exports.deleteResource = async function(req, res, model) {  
    try {
        const result = await persistence.delete(req.params.id, model);
        if (!result) return errors.manage(res, errors.resource_not_found, req.params.id);
        else return res.status(200).json(result);
    }
    catch (err) { 
        if(err.name == 'CastError') return errors.manage(res, errors.resource_not_found);
        else return errors.manage(res, errors.delete_request_error, err); 
    }
}

exports.deleteResourceList = async function(req, res, model, restriction) {  
    try {
        const result = await persistence.deletemore(req.query.filter, restriction, model);
        if (result == 0) return errors.manage(res, errors.resource_not_found);
        else return res.status(200).json({ deleted: result });
    }
    catch (err) { return errors.manage(res, errors.delete_request_error, err); }
}

exports.updateResource = async function(req, res, fields, model) {
    try {
        const modified_resource = await persistence.update(req.body, fields, req.resource, model, req.tenant);
        return res.status(200).json(modified_resource);
    }
    catch (err) { return errors.manage(res, errors.put_request_error, err); }
};

const prepareFilterDataset = function(id, filter) {
    if(filter.charAt( 0 ) == '[') filter = '{ "$or":' + filter + '}'; //for or request 
    let object = JSON.parse(filter);
    if(object.hasOwnProperty('feature')){
        if(object['feature']!=id){//bad request
            return null;
        };
    }
    else { //not found feature inside filter
        if(object.$and) object.$and.push({"feature":id});
       else object = { $and: [ object,{ "feature":id}] };
    }
    return object;
}