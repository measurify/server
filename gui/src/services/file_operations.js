import { get_generic, get_one_generic } from "./http_operations";
import Papa from "papaparse";

//experiment name separator
export const prefixFileSeparator = "#";

//return the prefix of the filename considering the defined separator
export function GetPrefixFilename(file) {
  return file.name.split(prefixFileSeparator)[0];
}

//this function build the description json item for the CSV file
//this function use birthtime ad startdate and enddate for measurements contained in the csv file
export async function csv_build_description(
  file,
  thing = undefined,
  device = undefined
) {
  const featureName = GetPrefixFilename(file);
  const qs = {
    filter: JSON.stringify({
      features: featureName,
    }),
    select: ["_id"],
  };
  let _device;
  let _feature;
  try {
    let res = await get_one_generic("features", featureName);
    _feature = res.response.data;

    if (device === undefined) {
      //get the device corresponsing to the selected feature
      res = await get_generic("devices", qs);
      _device = res.docs[0];
      if (res.docs.length === 0)
        return { error: "Device associated with the feature not found" };
    } else {
      _device = { _id: device };
    }
  } catch (error) {
    console.log(error);
    return { error: "Feature not found, please check the filename" };
  }

  //get feature components
  const itemlist = _feature.items.map((e) => e.name);

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

  //check if header only contains tags or feature items
  //add tags index to tags array
  header.map((e) => {
    if (e.endsWith("_Tag")) {
      tags.push(header.indexOf(e) + 1);
    } else {
      if (itemlist.indexOf(e) < 0)
        return {
          error: "File header contains unknown fields, please check it",
        };
    }
  });
  //also check if all feature items are in header
  //add items indexes to items array
  itemlist.map((item) => {
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
      items.push("_");
    }
  });

  const birthdate = Date(file.lastModified); // check if the format is okay
  //build description object
  let description = {
    thing: thing, // i suppose that the thing name is on the first column
    device: _device["_id"],
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
