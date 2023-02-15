import EM_configuration from "./configs/EM_config";
import Complete_configuration from "./configs/complete_config";

//this script manages several configuration according to the tenant name
//config dictionaries are imported into variables exportedwithin this script once the login has been successful
//basic configuration (i.e., the add tenant config and the base api url) is loaded in the ResetConfig function
//to add a new configuration for a specific tenant, define a new file in the /configs/ folder
//(considering the template of already present configurations)
//then add the import in this file and edit the LoadConfig function to load the desired configuration when required

//base url of APIs (define it as undefined if you want to use the url where the GUI is actually hosted)
//export const base_api_url = "https://localhost/v1";
//export const base_api_url = "https://hi-drive.measurify.org/v1";
export const base_api_url = undefined;

//name of this dashboard, shown to users
export const website_name = "CDB Dashboard";

//languages enabled for this GUI, only english "en" and italian "it" are supported with this version
//if no languages are enabled, the GUI will be localized in english
//export const languages = ["en", "it"];
export const languages = [];

//gui layout
// options are "horizontal" or "vertical"
export const layout = "vertical";

//operation pages
//those are the pages of operations performed on experiments,
// which are: updatehistory, downloadexperiment, removesteps
export const operationPages = [];

//dictionary of pages: key is the route for the API REST, value is an array that contains the fields shown to users
//action is a special field that will enable actions for each row || still required, future version may have it removed
export const pages = {};

//alias dictionary: key is the page, value are object with pairs of the fields that will be renamed into page table header ("key" is renamed as "value")
export const aliasPages = {};

//restriction dictionary: key is the page, value is an array of roles allowed to access to that page
export const restrictionPages = {};

//actions dictionary: key is the page, value is an array that contains actions || working actions arae "view" | "edit" | "delete" | "duplicate"
export const pageActions = {};

//view dictionary: key is the page, value is an array that contains the fields shown to the user with "view" action
export const viewFields = {};

//edit dictionary: key is the page, value is an array that contains the fields that can be edited with "edit" action
//fields should be specified in the same format of the object that will be represented:
// - key:"" for an string field,
// - key:NaN for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string

export const editFields = {};

//add dictionary: key is the page, value is an array that contains the fields that can will be used to post the entity
//fields should be specified in the same format of the objet that will be represented:
// - key:"" for an string field,
// - key:NaN for a numeric field
// - key:[""] for an array of string
// - key:[{subKey1:"",subkey2:""}] for an array of object with 2 keys each whose value is a string
export const addFields = {};

//edit fields specifiers dictionary
//this dictionary allow to specify particular behaviour for input fields, that can be managed by a specific function
// type can be "disable" -> policy is applied to fields to be disabled, true when field should be disabled
//
export const editFieldsSpecifier = {};

//dictionary to select the way to post entity/ies, it's an array which can contain "form", "file", or both
export const addTypes = {};

//dictionary for fetched types
//types are fetched on the /types route and matched with fields following this dictionary
export const fetchedPageTypes = {};

//dictionary for fetched data
//data is fetched on the according resource route and matched with fields following this dictionary
//the value of the specified field is the route to search for data. _ids of that route will be used as options
export const fetchedPageData = {};

export const guidelines = {};

export function ResetConfig() {
  //clear all the fields from objects and empty arrays while keeping references
  operationPages.length = 0;
  Object.keys(pages).forEach((key) => delete pages[key]);
  Object.keys(aliasPages).forEach((key) => delete aliasPages[key]);
  Object.keys(restrictionPages).forEach((key) => delete restrictionPages[key]);
  Object.keys(pageActions).forEach((key) => delete pageActions[key]);
  Object.keys(viewFields).forEach((key) => delete viewFields[key]);
  Object.keys(editFields).forEach((key) => delete editFields[key]);
  Object.keys(addFields).forEach((key) => delete addFields[key]);
  Object.keys(editFieldsSpecifier).forEach(
    (key) => delete editFieldsSpecifier[key]
  );
  Object.keys(addTypes).forEach((key) => delete addTypes[key]);
  Object.keys(fetchedPageTypes).forEach((key) => delete fetchedPageTypes[key]);
  Object.keys(fetchedPageData).forEach((key) => delete fetchedPageData[key]);
  Object.keys(guidelines).forEach((key) => delete guidelines[key]);

  //add fields required before the login
  addFields["tenants"] = {
    token: "",
    _id: "",
    organization: "",
    address: "",
    email: "",
    phone: "",
    admin_username: "",
    admin_password: "",
    //passwordhash: true,
  };

  addTypes["tenants"] = ["form"];
}

export function LoadConfig() {
  const tenantName = localStorage.getItem("user-tenant");

  let conf;

  //if tenant is deafult or not found in localstorage, show complete config
  if (tenantName === "" || tenantName === null) {
    conf = Complete_configuration();
  } else if (tenantName.startsWith("EM-")) {
    conf = EM_configuration();
  }
  //default config is the complete one
  else {
    conf = Complete_configuration();
  }

  Object.assign(operationPages, conf.operationPages);
  Object.assign(pages, conf.pages);
  Object.assign(aliasPages, conf.aliasPages);
  Object.assign(restrictionPages, conf.restrictionPages);
  Object.assign(pageActions, conf.pageActions);
  Object.assign(viewFields, conf.viewFields);
  Object.assign(editFields, conf.editFields);
  Object.assign(addFields, conf.addFields);
  Object.assign(editFieldsSpecifier, conf.editFieldsSpecifier);

  Object.assign(addTypes, conf.addTypes);
  Object.assign(fetchedPageTypes, conf.fetchedPageTypes);
  Object.assign(fetchedPageData, conf.fetchedPageData);
  Object.assign(guidelines, conf.guidelines);

  return;
}
