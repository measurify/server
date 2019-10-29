const ItemTypes = require('../models/itemTypes.js');

function shouldBeNumber(item) {
    return item.type == ItemTypes.number;
}

function isNumber(value) {
    if(!value) return true;
    if(!Array.isArray(value)) 
        return Number.isNaN(value);
    else 
        return value.every(number => !number || typeof number == 'number');
}

function areSameDimension(value, item) {
    if(!value) return true;
    if(!Array.isArray(value) || value.length == 1) return item.dimension == 0;
    else if(!Array.isArray(value[0])) return item.dimension == 1;
    else return item.dimension == 2;
}

function areSameTypes(sample, feature) {
    for(let[i, value] of sample.values.entries()) {
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
        if(sample.values.length != lenght)
            return 'No match between sample values size and feature items size  (' + sample.values.length + ' != ' +  lenght + ')'; 
        let result = areSameTypes(sample, feature); 
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