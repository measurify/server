const ItemTypes = require('../types/itemTypes.js');
const ComputationCodeTypes = require('../types/computationCodeTypes.js');

const authorizator = require('../security/authorization.js');

function shouldBeNumber(item) {
    return item.type == ItemTypes.number;
}

function isNumber(value) {
    if(!value) return true;
    if(!Array.isArray(value)) 
        return (typeof value == 'number');
    else 
        return value.every(number => !number || typeof number == 'number');
}

function areSameDimension(value, item) {
    if(!Array.isArray(value)) return item.dimension == 0;
    else if(!Array.isArray(value[0])) return item.dimension == 1;
    else return item.dimension == 2;
}

function areSameTypes(values, feature) {
    for(let[i, value] of values.entries()) {
        if(!areSameDimension(value, feature.items[i]))
            return 'No match between sample value size and feature items dimension  (' + value + ' != ' +  feature.items[i].dimension + ') [' + feature._id+ ']';
        if( (isNumber(value) && !shouldBeNumber(feature.items[i])) ||
            (!isNumber(value) && shouldBeNumber(feature.items[i])) )
            return 'No match between sample value type and feature items type  (' + value + ' != ' +  feature.items[i].type + ')';
    }
    return true;
}

exports.areCoherent = function(measurement, feature) {
    const lenght = feature.items.length;
    for (let [i, sample] of measurement.samples.entries()) {
        let values = sample.values;
        //if(feature.items.length!=1 && values.length==1 && values.isMongooseArray)
        //    values = values[0];    
        if(values.length != lenght)
            return 'No match between sample values size and feature items size  (' + values.length + ' != ' +  lenght + ')'; 
        let result = areSameTypes(values, feature); 
        if(result != true) return result;
    }
    return true;
}

exports.hasSamples = function(measurement) { 
    if (measurement.samples.length == 0) return false;
    return true;
}

exports.hasValues =  function(sample) {
    if (!sample.values || sample.values.length == 0) return false;
    return true;
}
