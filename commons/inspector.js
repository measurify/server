const ItemTypes = require('../types/itemTypes.js');
const ComputationCodeTypes = require('../types/computationCodeTypes.js');
const MetadataTypes = require('../types/metadataTypes.js');
const TopicFieldTypes = require('../types/TopicFieldTypes.js');

const authorizator = require('../security/authorization.js');

function shouldBeNumber(item) {
    return item.type == ItemTypes.number;
}

function isNumber(value) {
    if (!value) return true;
    if (!Array.isArray(value))
        return (typeof value == 'number');
    else
        return value.every(number => !number || typeof number == 'number');
}

function areSameDimension(value, item) {
    if (!Array.isArray(value)) return item.dimension == 0;
    else if (!Array.isArray(value[0])) return item.dimension == 1;
    else return item.dimension == 2;
}

function areSameTypes(values, feature) {
    for (let [i, value] of values.entries()) {
        if (!areSameDimension(value, feature.items[i])) {
            if (!Array.isArray(value)) { size = 0; }
            else if (!Array.isArray(value[0])) { size = 1; }
            else { size = 2; }
            return 'No match between sample value size and feature items dimension  (' + size + ' != ' + feature.items[i].dimension + '). Item no. ' + i + ', value: ' + value + ' [' + feature._id + ']'; // Franz xxx
        }
        if ((isNumber(value) && !shouldBeNumber(feature.items[i])) ||
            (!isNumber(value) && shouldBeNumber(feature.items[i])))
            return 'No match between sample value type and feature items type  (' + value + ' not of type ' + feature.items[i].type + '). Item no. ' + i + ', value: ' + value; // Franz xxx
    }
    return true;
}

exports.areCoherent = function (measurement, feature) {
    const lenght = feature.items.length;
    for (let [i, sample] of measurement.samples.entries()) {
        let values = sample.values;
        //if(feature.items.length!=1 && values.length==1 && values.isMongooseArray)
        //    values = values[0];    
        if (values.length != lenght)
            return 'No match between sample values size and feature items size  (' + values.length + ' != ' + lenght + '). Item no. ' + i; //Franz XXX
        let result = areSameTypes(values, feature);
        if (result != true) return result;
    }
    return true;
}

exports.hasSamples = function (measurement) {
    if (measurement.samples.length == 0) return false;
    return true;
}

exports.hasValues = function (sample) {
    if (!sample.values || sample.values.length == 0) return false;
    return true;
}

exports.checkMetadata = function (metadata, protocol) {
    const protocol_metadata = protocol.metadata.find(element => { if (element.name === metadata.name) return true; });
    if (!protocol_metadata) return "metadata " + metadata.name + " not found in protocol";
    if (Array.isArray(metadata.value) && protocol_metadata.type == MetadataTypes.vector) return true;
    if (metadata.value.length == 1 && typeof metadata.value[0] == "string" && protocol_metadata.type == MetadataTypes.text) return true;
    if (metadata.value.length == 1 && typeof metadata.value[0] == "number" && protocol_metadata.type == MetadataTypes.scalar) return true;
    if (metadata.value.length == 1 && typeof metadata.value[0] == "string" && protocol_metadata.type == MetadataTypes.scalar) {
        if (!isNaN(metadata.value[0])) {
            metadata.value[0] = Number(metadata.value[0]);
            return true;
        }
    }
    if (typeof metadata.value[0] == "string" && protocol_metadata.type == MetadataTypes.vector && metadata.value[0].startsWith('[') && metadata.value[0].endsWith(']')) {
        if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ';';
        metadata.value = metadata.value[0].slice(1, -1).split(process.env.CSV_VECTOR_DELIMITER);
        return true;
    }
    return 'metadata value ' + metadata.value + ' is not coherent with protocol type: ' + protocol_metadata.type;
}

exports.checkHistory = function (history_element, protocol) {
    const protocol_fields = [];
    for (let topic of protocol.topics) protocol_fields.push(...topic.fields)
    for (let field of history_element.fields) {
        const protocol_field = protocol_fields.find(element => { if (element.name === field.name) return true; });
        if (!protocol_field) return "history field " + field.name + " not found in protocol";

        let coherent = false

        if (field.value.length > 1) {
            if (protocol_field.type == TopicFieldTypes.vector) coherent = true;
        }
        else {
            if (typeof field.value[0] == "string" && protocol_field.type == TopicFieldTypes.text) coherent = true;
            if (typeof field.value[0] == "number" && protocol_field.type == TopicFieldTypes.scalar) coherent = true;
            if (typeof field.value[0] == "string" && protocol_field.type == TopicFieldTypes.scalar) {
                if (!isNaN(field.value[0])) {
                    field.value[0] = Number(field.value[0]);
                    coherent = true;
                }
            }
        }

        if (coherent == false) return 'history (step: ' + history_element.step + ') value ' + field.value + ' is not coherent with protocol type: ' + protocol_field.type;
    }
    return true;
}

exports.checkHeader = function (schema, header) {
    let requiredFields = [];
    let optionalFields = [];
    for (let key in schema.paths) {
        //owner taken from request user id
        if (schema.paths[key].isRequired && key != "owner") requiredFields.push(key);
        else optionalFields.push(key);
    }
    if (schema.subpaths) {
        for (let key in schema.subpaths) {
            if (schema.subpaths[key].isRequired && key != "history.step" && key != "history.fields.name") requiredFields.push(key);
            else optionalFields.push(key);
        }
    }
    if (!requiredFields.every(ai => header.includes(ai))) {
        let missing = [];
        for (val of requiredFields) { if (!header.includes(val)) { missing.push(val); } }
        return "Missing some required fields: needed " + missing + " in the header " + header;
    }
    if (!header.every(el => requiredFields.includes(el) || optionalFields.includes(el))) {
        let unrecognized = [];
        for (val of header) { if (!requiredFields.includes(val) && !optionalFields.includes(val)) { unrecognized.push(val); } }
        return "Some optional element not recognized:  " + unrecognized + " .  Required elements are " + requiredFields + ", optional are " + optionalFields;
    }
    return true;
}

