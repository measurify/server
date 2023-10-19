import { get_generic, get_one_generic } from "./http_operations";
import Papa from "papaparse";

//experiment name separator
export const prefixFileSeparator = "#";

//return the prefix of the filename considering the defined separator
export function GetPrefixName(file) {
  return file.name.split(prefixFileSeparator)[0];
}

//this function build the description json item for the CSV file
//this function use birthtime ad startdate and enddate for measurements contained in the csv file
export async function csv_build_description(file) {
  const featureName = GetPrefixName(file);
  let qs = {
    filter: JSON.stringify({
      features: featureName,
    }),
    select: ["_id"],
  };
  let device;
  let feature;
  let thingColumnName;
  try {
    let res = await get_one_generic("features", featureName);
    feature = res.response.data;

    //get the device corresponsing to the selected feature
    res = await get_generic("devices", qs);
    device = res.docs[0];
    if (res.docs.length === 0)
      return { error: "Device associated with the feature not found" };

    //get the thing column name
    qs = {
      filter: JSON.stringify({ tags: "contextual" }),
      select: ["_id"],
    };
    res = await get_generic("tags", qs);
    thingColumnName = res.docs[0]._id;
  } catch (error) {
    console.error(error);
    return { error: "Feature not found, please check the filename" };
  }

  //get feature components
  const itemlist = feature.items.map((e) => e.name);

  let header;
  const parseData = (_file) => {
    let data;
    return new Promise((resolve) => {
      Papa.parse(_file, {
        preview: 1,
        complete: (results) => {
          data = results.data[0];
          resolve(data);
        },
      });
    });
  };
  header = await parseData(file);

  //variables to store indexes of csv header
  let items = [];
  let tags = [];
  let warnings = [];
  let errors = [];
  let thingColumnIndex = -1;

  //check if header only contains tags or feature items
  //add tags index to tags array
  header.forEach((e) => {
    //check if the thing column is present
    if (e === thingColumnName) {
      thingColumnIndex = header.indexOf(e) + 1;
    } else if (e.endsWith("_Tag")) {
      tags.push(header.indexOf(e) + 1);
    } else {
      if (itemlist.indexOf(e) < 0) {
        errors.push(
          e +
            " File header contains unknown fields (" +
            e +
            "), please check it\n"
        );
      }
    }
  });
  //if thing column is not present, return an error
  if (thingColumnIndex === -1)
    errors.push("Thing column not found, please check the filename\n");

  //in case of errors, return the error array
  if (errors.length !== 0) return { errors: errors };

  //also check if all feature items are in header
  //add items indexes to items array
  itemlist.forEach((item) => {
    let idx = header.indexOf(item);
    if (idx >= 0) {
      //1-indexed for description file
      items.push(idx + 1);
    }
    //feature item is not present in csv header
    else {
      warnings.push(
        item +
          " not specified in file header but present for questionnaire " +
          featureName +
          "\n"
      );
      //add a placeholder for the missing item
      items.push("_");
    }
  });
  const birthdate = new Date(file.lastModified); // check if the format is okay
  //build description object
  let description = {
    thing: thingColumnIndex, // i suppose that the thing name is on the first column
    device: device["_id"],
    items: {},
    tags: tags,
    startdate: birthdate,
    enddate: birthdate,
    feature: featureName,
  };
  //add items field
  description.items[featureName] = items;
  if (warnings.length !== 0) description.warnings = warnings;

  return description;
}
