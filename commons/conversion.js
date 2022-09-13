exports.csv2json = function (owner, header, data, schema, modelName) {//items over more lines
    let result = {};
    let results = [];
    let supportObj = {};
    for (let element of data) {
        arr = element.split(",");
        if (arr.length > header.length) arr = arr.slice(0, header.length);
        if (Object.keys(result).length > 0 && (header.indexOf("_id") == -1 || arr[header.indexOf("_id")])) {//ended the entity, save it
            results.push(saveResult(modelName, result, owner));
            result = {};
        }
        for (let key of header) {
            if (schema.paths[key]) {//path
                if (schema.paths[key].instance == 'Array') {
                    if (!result[key]) result[key] = [];//not found, create it   
                    if (!arr[header.indexOf(key)]) continue;//blank element
                    result[key].push(...cleanFunction(arr[header.indexOf(key)]));
                }
                else if (header.indexOf("_id") == -1 || arr[header.indexOf("_id")]) result[key] = arr[header.indexOf(key)];//not Array elements can't be splitted in more lines
            }
            else //subpath
            {
                if (arr[header.indexOf(key)]) {
                    if (arr[header.indexOf(key)].startsWith("[")) {//Array
                        let stringData = arr[header.indexOf(key)];
                        stringData = stringData.slice(1, -1);//remove []
                        stringData = stringData.split(";");//doesn't remove "" because the position is important
                        let subKey = key.split(".");
                        if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it
                        if (!supportObj[subKey[0]]) supportObj[subKey[0]] = [];//not found, create it                        
                        if (supportObj[subKey[0]].length == 0 && stringData.length > 0) {//first time
                            for (let i in stringData) { supportObj[subKey[0]].push({}); }
                        }
                        for (let k in stringData) { if (stringData[k]) supportObj[subKey[0]][k][subKey[1]] = stringData[k]; }
                    }
                    else {//the subpath is not an array
                        let subKey = key.split(".");
                        if (!result[subKey[0]]) result[subKey[0]] = [];//not found, create it                      
                        if (!supportObj[subKey[0]]) supportObj[subKey[0]] = {};//not found, create it    
                        supportObj[subKey[0]][subKey[1]] = arr[header.indexOf(key)];
                    }
                }
            }
        }
        if (Object.keys(supportObj).length > 0) {
            for (let k of Object.keys(supportObj)) {
                if (Array.isArray(supportObj[k])) { for (let j in supportObj[k]) { result[k].push(supportObj[k][j]); } }
                else result[k].push(supportObj[k]);
            }
            supportObj = {};
        }
    }
    //save at the end of for loop
    results.push(saveResult(modelName, result, owner));
    return results;
};

const cleanFunction = function (arr) {
    let array = arr.split(/[[\];, ]/);
    array = array.filter(function (el) {
        return el != "";
    });
    return array;
}

const saveResult = function (modelName, result, owner) {
    if (modelName === "Feature") {//accept items.unit=" "
        if (result.items) {
            result.items = result.items.map(function (el) {
                if (el.name) { if (!el.unit) { el.unit = " "; } }
                return el;
            })
        }
    }
    result["owner"] = owner;
    return result;
}