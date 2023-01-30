import { isDefault, removeDefaultElements } from "./misc_functions";

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

export function maintainEmptyElement(
  original,
  path,
  fieldSpecifier,
  resource,
  item = undefined
) {
  let tmp = cloneDeep(original);
  let tmpPtr = tmp;
  let fieldSpecifierCpy = cloneDeep(fieldSpecifier[resource]);
  const tmpPath = [...path];

  //get more nested array
  for (let i = 0; i < tmpPath.length; i++) {
    if (path[i] === undefined) break;
    tmpPtr = tmpPtr[path[i]];
  }

  //get the appropriate item, if possible
  for (let i = 0; i < tmpPath.length; i++) {
    if (path[i] === undefined) break;
    if (fieldSpecifierCpy === undefined) break;
    //ignore indexes for fieldSpecifierCpy
    if (typeof path[i] === "number") fieldSpecifierCpy = fieldSpecifierCpy[0];
    else fieldSpecifierCpy = fieldSpecifierCpy[path[i]];
  }

  //non array case
  if (!Array.isArray(fieldSpecifierCpy)) return tmp;

  //add item according to addfield dictionary
  if (fieldSpecifierCpy !== undefined) {
    //0-length array
    if (tmpPtr.length === 0) {
      if (fieldSpecifierCpy[0].constructor === Object) {
        tmpPtr.push({
          ...fieldSpecifierCpy[0],
        });
      } else {
        tmpPtr.push("");
      }
    }
    //else 0-length array
    else {
      if (tmpPtr[0].constructor === Object) {
        //check if there are no default elements in array
        if (tmpPtr.filter((e) => isDefault(e)).length === 0) {
          tmpPtr.push({
            ...fieldSpecifierCpy[0],
          });
        }
      } else {
        if (!tmpPtr.includes("")) {
          tmpPtr.push("");
        }
      }
    }
  }

  //add item according to params
  if (item !== undefined && fieldSpecifierCpy === undefined) {
    if (tmpPtr.length === 0) {
      if (item.constructor === Object) {
        tmpPtr.push({ ...item });
      } else {
        tmpPtr.push(item);
      }
    }
    //else 0-length array
    else {
      if (tmpPtr.filter((e) => isDefault(e)).length === 0) {
        if (item.constructor === Object) {
          tmpPtr.push({ ...item });
        } else {
          tmpPtr.push(item);
        }
      }
    }
  }
  return tmp;
}
