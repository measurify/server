import { isFeatureInUse, alwaysTrue } from "./services/validations";

//url of APIs
export const api_url = "https://hi-drive.measurify.org/v1";
//export const api_url = "https://localhost/v1";

//name of this dashboard, shown to users
export const website_name = "Admin Dashboard";

//languages enabled for this GUI, only english "en" and italian "it" are supported with this version
//if no languages are enabled, the GUI will be localized in english
//export const languages = ["en", "it"];
export const languages = [];

//gui layout
// options are "horizontal" or "vertical"
export const layout = "vertical";

//dictionary of pages: key is the route for the API REST, value is an array that contains the fields shown to users
//action is a special field that will enable actions for each row || still required, future version may have it removed
export const pages = {};
pages["users"] = ["username", "type", "actions"];
//pages["tags"] = ["_id", "actions"];
//pages["things"] = ["_id", "actions"];
//pages["features"] = ["_id", "actions"];
//pages["devices"] = ["_id", "tags", "actions"];
pages["protocols"] = ["_id", "description", "actions"];
pages["experiments"] = ["_id", "description", "protocol", "actions"];
/*pages["measurements"] = [
  "thing",
  "feature",
  "device",
  "startDate",
  "tags",
  "actions",
];*/

//alias dictionary: key is the page, value are object with pairs of the fields that will be renamed into page table header ("key" is renamed as "value")
export const aliasPages = {};
//aliasPages["features"] = { _id: "Feature Name", actions: "Actions" };
//aliasPages["tags"] = { _id: "Tag Name", actions: "Actions" };
//aliasPages["devices"] = { _id: "Device Name", actions: "Actions" };

//actions dictionary: key is the page, value is an array that contains actions || working actions arae "view" | "edit" | "delete" | "duplicate"
export const pageActions = {};
///pageActions["features"] = ["view", "edit", "duplicate", "delete"];
pageActions["users"] = ["view", "delete"];
//pageActions["things"] = ["view", "delete"];
//pageActions["tags"] = ["view", "edit", "delete"];
//pageActions["devices"] = ["view", "edit", "delete"];
pageActions["protocols"] = ["view", "delete"];
pageActions["experiments"] = ["view", "edit", "duplicate", "delete"];
//pageActions["measurements"] = ["view", "edit", "delete"];

//view dictionary: key is the page, value is an array that contains the fields shown to the user with "view" action
export const viewFields = {};
viewFields["users"] = ["username", "type", "actions", "fieldmask", "status"];
/*viewFields["features"] = [
  { items: ["name", "type", "unit", "dimension"] },
  "tags",
];
viewFields["tags"] = ["tags"];
viewFields["things"] = ["_id", "visibility", "tags"];
viewFields["devices"] = ["_id", "features", "tags", "scripts"];*/
viewFields["protocols"] = ["_id", "description", "metadata"];
viewFields["experiments"] = [
  "_id",
  "description",
  "state",
  "startDate",
  "endDate",
  "manager",
  "place",
  "protocol",
  "metadata",
];
/*viewFields["measurements"] = [
  "thing",
  "feature",
  "device",
  "startDate",
  "visibility",
  "tags",
  "samples",
];*/

//edit dictionary: key is the page, value is an array that contains the fields that can be edited with "edit" action
//fields should be specified in the same format of the object that will be represented:
// - key:"" for an string field,
// - key:NaN for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string

export const editFields = {};

editFields["experiments"] = {
  _id: "",
  description: "",
  state: NaN,
  startDate: "",
  endDate: "",
  manager: "",
  place: [{ name: "" }],
  metadata: [{ name: "", value: "" }],
  tags: [""],
  visibility: "",
};

/*editFields["features"] = {
  _id: "",
  items: [{ name: "", type: "", unit: "", dimension: NaN }],
  tags: [""],
};
editFields["tags"] = {
  tags: [""],
};
editFields["devices"] = { visibility: "", tags: [""] };
editFields["measurements"] = { tags: [""] };*/
//add dictionary: key is the page, value is an array that contains the fields that can will be used to post the entity
//fields should be specified in the same format of the objet that will be represented:
// - key:"" for an string field,
// - key:NaN for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string

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
/*addFields["tags"] = { _id: "", tags: [""] };
addFields["things"] = { _id: "", visibility: "", tags: [""] };
addFields["features"] = {
  _id: "",
  items: [{ name: "", type: "", unit: "", dimension: NaN, range: [""] }],
  tags: [""],
};


addFields["devices"] = {
  _id: "",
  features: [""],
};
*/
addFields["users"] = { username: "", password: "", type: "" };
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

//NOTE: experiments page works differently, so keep it empty
addFields["experiments"] = {
  _id: "",
  description: "",
  state: NaN,
  startDate: "",
  endDate: "",
  manager: "",
  place: [{ name: "" }],
};

//NOTE: measurements page works differently, so keep it empty
/*addFields["measurements"] = {
  thing: "",
  device: "",
  tags: [""],
};*/

//edit fields specifiers dictionary
//this dictionary allow to specify particular behaviour for input fields, that can be managed by a specific function
// type can be "disable" -> policy is applied to fields to be disabled, true when field should be disabled
//
export const editFieldsSpecifier = {};
/*editFieldsSpecifier["features"] = {
  _id: { type: "disable", policy: isFeatureInUse },
  items: { type: "disable", policy: isFeatureInUse },
};*/

//dictionary to select the way to post entity/ies, it's an array which can contain "form", "file", or both
export const addTypes = {};
//addTypes["tags"] = ["form", "file"];
//addTypes["things"] = ["form", "file"];
//addTypes["features"] = ["form", "file"];
addTypes["users"] = ["form", "file"];
//addTypes["devices"] = ["form", "file"];
addTypes["tenants"] = ["form"];
addTypes["protocols"] = ["form", "file"];
addTypes["experiments"] = ["form", "file"];
//addTypes["measurements"] = ["form"];

//dictionary for fetched types
//types are fetched on the /types route and matched with fields following this dictionary
export const fetchedPageTypes = {};
fetchedPageTypes["users"] = { type: "UserRoles", status: "UserStatusTypes" };
/*fetchedPageTypes["devices"] = {
  measurementBufferPolicy: "MeasurementBufferPolicyTypes",
  visibility: "VisibilityTypes",
};
fetchedPageTypes["things"] = {
  visibility: "VisibilityTypes",
};
fetchedPageTypes["tag"] = {
  visibility: "VisibilityTypes",
};
fetchedPageTypes["things"] = {
  visibility: "VisibilityTypes",
};
fetchedPageTypes["scripts"] = {
  visibility: "VisibilityTypes",
};
fetchedPageTypes["rights"] = {
  type: "RightTypes",
};
fetchedPageTypes["features"] = {
  items: { type: "ItemTypes" },
};
fetchedPageTypes["measurements"] = {
  visibility: "VisibilityTypes",
};
fetchedPageTypes["issues"] = {
  type: "IssueTypes",
  status: "IssueStatusType",
};*/
fetchedPageTypes["protocols"] = {
  metadata: { type: "MetadataTypes" },
  field: { type: "TopicFieldTypes" },
};
fetchedPageTypes["experiments"] = {
  visibility: "VisibilityTypes",
  //state: "ExperimentStateTypes",
};
/*fetchedPageTypes["constraints"] = {
  type1: "ConstraintTypes",
  type2: "ConstraintTypes",
};*/

//dictionary for fetched data
//data is fetched on the according resource route and matched with fields following this dictionary
//the value of the specified field is the route to search for data. _ids of that route will be used as options
export const fetchedPageData = {};
/*fetchedPageData["tags"] = { tags: "tags" };
fetchedPageData["things"] = { tags: "tags" };
fetchedPageData["devices"] = { features: "features" };
fetchedPageData["features"] = { tags: "tags" };
fetchedPageData["measurements"] = {
  device: "devices",
  thing: "things",
  tags: "tags",
};*/

export const guidelines = {};
guidelines["protocols"] = {
  _id: "Please, enter protocol's name.",
  description: "Please, enter a short protocol's description.",
};
guidelines["experiments"] = {
  _id: "Please, enter experiment's name (N.B. don't use the # character in experiment's name).",
  state: "Please, enter 0 for ongoing experiment, 1 for finished experiment.",
  description: "Please, enter a short experiment's description.",
  manager: "Please, enter the experiment's company name (as a short Acronym).",
  startDate: "Please, use yyyy/mm/dd format.",
  endDate: "Please, use yyyy/mm/dd format.",
};
