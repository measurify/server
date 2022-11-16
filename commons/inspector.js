const ItemTypes = require("../types/itemTypes.js");
const ComputationCodeTypes = require("../types/computationCodeTypes.js");
const MetadataTypes = require("../types/metadataTypes.js");
const TopicFieldTypes = require("../types/topicFieldTypes.js");

const authorizator = require("../security/authorization.js");

function shouldBeNumber(item) {
  return item.type == ItemTypes.number;
}

function isNumber(value) {
  if (!value) return true;
  if (!Array.isArray(value)) return typeof value == "number";
  else return value.every((number) => !number || typeof number == "number");
}

function areSameDimension(value, item) {
  if (!Array.isArray(value)) return item.dimension == 0;
  else if (!Array.isArray(value[0])) return item.dimension == 1;
  else return item.dimension == 2;
}

function areSameTypes(values, feature) {
  for (let [i, value] of values.entries()) {
    if (!areSameDimension(value, feature.items[i])) {
      if (!Array.isArray(value)) size = 0;
      else if (!Array.isArray(value[0])) size = 1;
      else size = 2;
      return ("No match between sample value size and feature items dimension  (" + size + " != " + feature.items[i].dimension + "). Item no. " + i + ", value: " + value + " [" + feature._id + "]");
    }
    if ((isNumber(value) && !shouldBeNumber(feature.items[i])) ||
      (!isNumber(value) && shouldBeNumber(feature.items[i])))
      return ("No match between sample value type and feature items type  (" + value + " not of type " + feature.items[i].type + "). Item no. " + i + ", value: " + value);
    if (feature.items[i].type == ItemTypes.enum) {
      if (!feature.items[i].range.includes(value))
        return ("No match between sample value type and feature items type  (" + value + " not in range " + feature.items[i].range + "). Item no. " + i + ", value: " + value);
    }
  }
  return true;
}

exports.areCoherent = function (resource, feature) {
  const lenght = feature.items.length;
  if (resource.constructor.modelName == 'Measurement') {
    measurement = resource;
    for (let [i, sample] of measurement.samples.entries()) {
      let values = sample.values;
      if (values.length != lenght) return ("No match between sample values size and feature items size  (" + values.length + " != " + lenght + "). Item no. " + i);
      let result = areSameTypes(values, feature);
      if (result != true) return result;
    }
    return true;
  }
  else if (resource.constructor.modelName == 'Timesample') {
    timesample = resource;
    let values = timesample.values;
    if (!values || values.length == 0) throw new Error("ValidationError: values");
    if (values.length != lenght) return ("No match between timesample values size and feature items size  (" + values.length + " != " + lenght + ")");
    let result = areSameTypes(values, feature);
    if (result != true) return result;
    return true;
  }
  return ("It is not possible to check coherence of a resource of type " + resource.constructor.modelName);
};

exports.hasSamples = function (measurement) {
  if (measurement.samples.length == 0) return false;
  return true;
};

exports.hasValues = function (sample) {
  if (!sample.values || sample.values.length == 0) return false;
  return true;
};

function inRange(protocol_element, element, itemName) {
  if (protocol_element.range !== undefined && protocol_element.range.length) {
    if (element.value < protocol_element.range[0]) {
      return (itemName + " " + protocol_element.name + " value " + element.value +
        " is not coherent with protocol range minimum value: " + protocol_element.range[0]);
    }
    if (protocol_element.range[1] !== undefined && element.value > protocol_element.range[1]) {
      return (itemName + " " + protocol_element.name + " value " + element.value +
        " is not coherent with protocol range maximum value: " + protocol_element.range[1]);
    }
  }
  return true;
}

exports.checkMetadata = function (metadata, protocol) {
  const protocol_metadata = protocol.metadata.find((element) => {
    if (element.name === metadata.name) return true;
  });
  if (!protocol_metadata) return "metadata " + metadata.name + " not found in protocol";
  switch (protocol_metadata.type) {

    case MetadataTypes.vector:
      if (Array.isArray(metadata.value)) return true;
      if (typeof metadata.value == "string" &&
        metadata.value.startsWith("[") && metadata.value.endsWith("]")) {
        if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ";";
        metadata.value = metadata.value.slice(1, -1).split(process.env.CSV_VECTOR_DELIMITER)
          .map(function (item) {
            let value = parseFloat(item);
            if (value !== NaN) return value;
            else return item;
          });
        return true;
      }
      break;

    case MetadataTypes.text:
      if (typeof metadata.value == "string") return true;
      break;

    case MetadataTypes.scalar:
      if (typeof metadata.value == "number") return inRange(protocol_metadata, metadata, "metadata");
      if (typeof metadata.value == "string") {
        let value = parseFloat(metadata.value);
        if (!isNaN(value)) {
          metadata.value = value;
          return inRange(protocol_metadata, metadata);
        }
      }
      break;

    case MetadataTypes.enum:
      if (protocol_metadata.range === undefined) return ("enum range of metadata " + protocol_metadata.name + " not defined, please update the protocol");
      if (!protocol_metadata.range.includes(metadata.value)) {
        return ("metadata " + protocol_metadata.name + " value " + metadata.value +
          " is not inside the range of enum values");
      }
      else return true;
      break;
  }

  return (
    "metadata value " +
    metadata.value +
    " is not coherent with protocol type: " +
    protocol_metadata.type
  );
};

exports.checkHistory = function (history_element, protocol) {
  const protocol_fields = [];
  for (let topic of protocol.topics) protocol_fields.push(...topic.fields);
  for (let field of history_element.fields) {
    const protocol_field = protocol_fields.find((element) => {
      if (element.name === field.name) return true;
    });
    if (!protocol_field)
      return "history field " + field.name + " not found in protocol";

    let coherent = false;

    switch (protocol_field.type) {

      case TopicFieldTypes.vector:
        if (Array.isArray(field.value)) coherent = true;;
        if (typeof field.value == "string" &&
          field.value.startsWith("[") && field.value.endsWith("]")) {
          if (!process.env.CSV_VECTOR_DELIMITER) process.env.CSV_VECTOR_DELIMITER = ";";
          field.value = field.value.slice(1, -1).split(process.env.CSV_VECTOR_DELIMITER)
            .map(function (item) {
              let value = parseFloat(item);
              if (value !== NaN) return value;
              else return item;
            });
          coherent = true;;
        }
        break;

      case TopicFieldTypes.text:
        if (typeof field.value == "string") coherent = true;
        break;

      case TopicFieldTypes.scalar:
        if (typeof field.value == "number") {
          coherent = inRange(protocol_field, field, "field"); if (coherent !== true) { return coherent }
        }
        if (typeof field.value == "string") {
          let value = parseFloat(field.value);
          if (!isNaN(value)) {
            field.value = value;
            coherent = inRange(protocol_field, field, "field"); if (coherent !== true) { return coherent }
          }
        }
        break;


      case TopicFieldTypes.enum:
        if (protocol_field.range === undefined) return ("enum range of field " + protocol_field.name + " not defined, please update the protocol");
        if (!protocol_field.range.includes(field.value)) {
          return ("field " + protocol_field.name + " value " + field.value +
            " is not inside the range of enum values");
        }
        else coherent = true;
        break;
    }

    if (coherent == false)
      return (
        "history (step: " +
        history_element.step +
        ") value " +
        field.value +
        " in " +
        field.name +
        " is not coherent with protocol type: " +
        protocol_field.type
      );
  }
  return true;
};

exports.checkHeader = function (schema, header) {
  let requiredFields = [];
  let optionalFields = [];
  for (let key in schema.paths) {
    //owner taken from request user id
    if (schema.paths[key].isRequired && key != "owner")
      requiredFields.push(key);
    else optionalFields.push(key);
  }
  if (schema.subpaths) {
    for (let key in schema.subpaths) {
      if (
        schema.subpaths[key].isRequired &&
        key != "history.step" &&
        key != "history.fields.name"
      )
        requiredFields.push(key);
      else optionalFields.push(key);
    }
  }
  if (!requiredFields.every((ai) => header.includes(ai))) {
    let missing = [];
    for (val of requiredFields) {
      if (!header.includes(val)) {
        missing.push(val);
      }
    }
    return (
      "Missing some required fields: needed " +
      missing +
      " in the header " +
      header
    );
  }
  if (
    !header.every(
      (el) => requiredFields.includes(el) || optionalFields.includes(el)
    )
  ) {
    let unrecognized = [];
    for (val of header) {
      if (!requiredFields.includes(val) && !optionalFields.includes(val)) {
        unrecognized.push(val);
      }
    }
    return (
      "Some optional element not recognized:  " +
      unrecognized +
      " .  Required elements are " +
      requiredFields +
      ", optional are " +
      optionalFields
    );
  }
  return true;
};
