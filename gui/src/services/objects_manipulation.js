import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  isDefault,
  removeDefaultElements,
  nonDefaultLength,
} from "./misc_functions";
const XLSX = require("xlsx");
const cloneDeep = require("clone-deep");

// this function sort keys of an object and of its array-of-objects values (recursively) based on a template
export function sortObject(obj, template) {
  //keys of the object to sort
  let keys = Object.keys(obj);
  //sorted array of keys
  const sortingKeys = Object.keys(template);
  //remove uncommon keys between the two arrays from the key array
  keys = keys.filter((ob) => {
    return sortingKeys.indexOf(ob) !== -1;
  });
  //sort the keys in the key array
  keys.sort((a, b) => sortingKeys.indexOf(a) - sortingKeys.indexOf(b));

  const sorted = keys.reduce((accumulator, key) => {
    if (
      Array.isArray(obj[key]) &&
      obj[key].length !== 0 &&
      obj[key][0].constructor === Object
    ) {
      const tmp = obj[key].map((el) => {
        return sortObject(el, template[key][0]);
      });

      accumulator[key] = tmp;
    } else accumulator[key] = obj[key];

    return accumulator;
  }, {});
  return sorted;
}

//this function will check of each field of the object if it's an array, and then, only for array values, check if empty elements are contained into that array
export function maintainEmptyElements(original, fieldSpecifier, resource) {
  const keys = Object.keys(original);
  let copy = cloneDeep(original);
  for (let i = 0; i < keys.length; i++) {
    if (Array.isArray(copy[keys[i]])) {
      copy = maintainEmptyElement(copy, [keys[i]], fieldSpecifier, resource);
    }
  }
  return copy;
}

//this function check if an array contains a default element,
//a default element is added when required
//this causes issue for array of boolean, since boolean has no default value is difficult to know when to add an item

export function maintainEmptyElement(
  original,
  path,
  fieldSpecifier,
  resource,
  item = undefined
) {
  let tmp = cloneDeep(original);
  let tmpPtr = tmp;
  let fieldSpecifierCpy =
    fieldSpecifier !== undefined
      ? cloneDeep(fieldSpecifier[resource])
      : undefined;
  const tmpPath = [...path];

  //get the appropriate array to validate
  for (let i = 0; i < tmpPath.length; i++) {
    if (path[i] === undefined) break;
    tmpPtr = tmpPtr[path[i]];
  }
  const nonDefLen = nonDefaultLength(tmpPtr);
  const len = tmpPtr.length;

  //if at least one element is non default, can return
  if (nonDefLen < len) {
    return tmp;
  }
  //otherwise, need to get the appropriate item to append to array

  let element;

  //get the appropriate item, travelling the fieldSpecified (addFields or editFields) according to path
  //fieldSpecifierCpy becomes undefined when the item cannot be found there
  for (let i = 0; i < tmpPath.length; i++) {
    //if path or fieldSpecifier becomes undefined, break
    if (path[i] === undefined) break;
    if (fieldSpecifierCpy === undefined) break;
    //indexes of path should be treated as 0
    if (typeof path[i] === "number") fieldSpecifierCpy = fieldSpecifierCpy[0];
    else fieldSpecifierCpy = fieldSpecifierCpy[path[i]];
  }

  //item found in fieldSpecifierCpy exist and it's not an array return
  if (fieldSpecifierCpy !== undefined && !Array.isArray(fieldSpecifierCpy))
    return tmp;

  //add item according to addfield/editfield dictionary
  if (fieldSpecifierCpy !== undefined) {
    if (fieldSpecifierCpy[0].constructor === Object) {
      element = {
        ...fieldSpecifierCpy[0],
      };
    } else {
      element = "";
    }
  }

  //add item according to param item
  if (item !== undefined && fieldSpecifierCpy === undefined) {
    if (item.constructor === Object) {
      element = { ...item };
    } else {
      element = item;
    }
  }
  if (element !== undefined) tmpPtr.push(element);
  return tmp;
}

export function convertArrayOfObjectsToCSV(data, columnDelimiter = ",") {
  const keys = Object.keys(data[0]);
  let csvContent = keys.join(columnDelimiter) + "\n";

  data.forEach((item) => {
    const row = keys
      .map((key) =>
        typeof item[key] === "string"
          ? item[key].replaceAll(columnDelimiter, "")
          : item[key]
      )
      .join(columnDelimiter);
    csvContent += row + "\n";
  });

  return csvContent;
}

export function convertArrayOfObjectsToPDF(data) {
  const doc = new jsPDF("landscape");
  const tableHeaders = Object.keys(data[0]);
  const tableData = data.map((item) => Object.values(item));

  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: 10, // Set the starting Y position for the table
    pageBreak: "auto", // Automatically break pages as needed
  });

  return doc;
}

export function convertArrayOfSheetsToXLSX(sheets) {
  //if sheets list is not empty, the function uses the sheets list to create the xlsx file
  //otherwise, it creates a single sheet xlsx file
  const wb = XLSX.utils.book_new();
  let ws;
  sheets.forEach((sheet, index) => {
    ws = XLSX.utils.json_to_sheet(sheet["data"]);
    XLSX.utils.book_append_sheet(wb, ws, sheet["name"]);
  });
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  var blob = new Blob([new Uint8Array(wbout)], {
    type: "application/octet-stream",
  });

  return blob;
}
