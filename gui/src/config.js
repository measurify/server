import { isFeatureInUse, alwaysTrue } from "./services/validations";

//url of API to POST/GET the data
export const api_url = "https://localhost/v1";

//name of this gui, shown to the user
export const website_name = "Measurify Admin Dashboard";

//languages enabled for this GUI, only english "en" and italian "it" are supported with this version
//if no languages are enabled, the GUI will be localized in english
export const languages = [];

//dictionary of pages: key is the route for the API REST, value array contains the fields shown to the user
//(action is a special field that will) enable actions for each row || still required, future version could have it removed
export const pages = {};
pages["users"] = ["username", "type", "actions"];
pages["tags"] = ["_id", "actions"];
pages["features"] = ["_id", "actions"];
pages["devices"] = ["_id", "tags", "actions"];
pages["protocols"] = ["_id", "description", "actions"];
pages["experiments"] = ["_id", "description", "protocol", "actions"];

//alias dictionary: key is the page, value object contains the fields that will be renamed into page table header key => value
export const aliasPages = {};
aliasPages["features"] = { _id: "Feature Name", actions: "Actions" };
aliasPages["tags"] = { _id: "Tag Name", actions: "Actions" };
aliasPages["devices"] = { _id: "Device Name", actions: "Actions" };

//actions dictionary: key is the page, value array contains the possible actions, that are view | edit | delete
export const pageActions = {};
pageActions["features"] = ["view", "edit", "duplicate", "delete"];
pageActions["users"] = ["view", "delete"];
pageActions["tags"] = ["view", "edit", "delete"];
pageActions["devices"] = ["view", "edit", "delete"];
pageActions["protocols"] = ["view", "delete"];
pageActions["experiments"] = ["view", "delete"];

//view dictionary: key is the page, value array contains the fields shown to the user with "view" action
export const viewFields = {};
viewFields["users"] = ["username", "type", "actions", "fieldmask", "status"];
viewFields["features"] = [
  { items: ["name", "type", "unit", "dimension"] },
  "tags",
];
viewFields["tags"] = ["tags"];
viewFields["devices"] = ["_id", "features", "tags", "scripts"];
viewFields["protocols"] = ["_id", "description", "metadata"];
viewFields["experiments"] = ["_id", "description", "protocol", "metadata"];

//edit dictionary: key is the page, value array contains the fields that can be edited with "edit" action
//fields should be specified in the same format of the objet that will be represented:
// - key:"" for an string field,
// - key:0 for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string
// and so on
export const editFields = {};
editFields["features"] = {
  _id: "",
  items: [{ name: "", type: "", unit: "", dimension: NaN }],
  tags: [""],
};
editFields["tags"] = {
  tags: [""],
};
editFields["devices"] = { visibility: "", tags: [""] };

//add dictionary: key is the page, value array contains the fields that can will be used to post the entity
//fields should be specified in the same format of the objet that will be represented:
// - key:"" for an string field,
// - key:0 for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string
// and so on
export const addFields = {};
addFields["tenants"] = {
  token: "",
  _id: "",
  organization: "",
  address: "",
  email: "",
  phone: "",
  admin_username: "",
  admin_password: "",
  passwordhash: "",
};
addFields["tags"] = { _id: "", tags: [""] };
addFields["features"] = {
  _id: "",
  items: [{ name: "", type: "", unit: "", dimension: NaN }],
  tags: [""],
};
addFields["users"] = { username: "", password: "", type: "" };

addFields["devices"] = {
  _id: "",
  features: [""],
};

addFields["protocols"] = {
  _id: "",
  description: "",
  metadata: [
    {
      name: "",
      description: "",
      type: "",
    },
  ],
  topics: [
    {
      name: "",
      description: "",
      fields: [{ name: "", description: "", type: "" }],
    },
  ],
};

//experiments page works differently, so keep it empty
addFields["experiments"] = {
  _id: "",
  description: "",
  // todoanonymization: true,
  state: "",
};

//edit fields specifiers dictionary
//this dictionary allow to specify particular behaviour for input fields, that can be managed by a specific function
// type can be "disable" -> policy is applied to fields to be disabled
//
export const editFieldsSpecifier = {};
editFieldsSpecifier["features"] = {
  _id: { type: "disable", policy: isFeatureInUse },
  items: { type: "disable", policy: isFeatureInUse },
};

//dictionary to select the way to post entity/ies, it's an array containing "form", "file", or both
export const addTypes = {};
addTypes["tags"] = ["form", "file"];
addTypes["features"] = ["form", "file"];
addTypes["tenants"] = ["form"];
addTypes["users"] = ["form", "file"];
addTypes["devices"] = ["form", "file"];
addTypes["protocols"] = ["form", "file"];
addTypes["experiments"] = ["form", "file"];

//fetched types alias
export const fetchedPageTypes = {};
fetchedPageTypes["users"] = { type: "UserRoles", status: "UserStatusTypes" };
fetchedPageTypes["devices"] = {
  measurementBufferPolicy: "MeasurementBufferPolicyTypes",
};
