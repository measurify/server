import { get_one_generic } from "./http_operations";

//variable to store role as a simple cache
let roleCache = undefined;

//get and set the role definition
export async function SetRoleDefinition() {
  const role = localStorage.getItem("user-role");
  if (role === null || role === undefined || role === "") return;
  const response = await get_one_generic("roles", role);
  if (response !== undefined)
    localStorage.setItem("role", JSON.stringify(response.response.data));
}

//check if an user is allowed to do a specific action
//returns true if the use can perform the action, false otherwise
export function canDo(userRole, resource, actionCRUD) {
  //check if cache-like variable is set
  if (roleCache === undefined) {
    //get role from localstorage (saved there after login)
    const tmp = localStorage.getItem("role");

    //if the role is not defined, use the hardcoded version
    if (tmp === undefined || tmp === null)
      return canDoDeprecated(userRole, resource, actionCRUD);

    //if role was found from the localstorage, set the cache-like variable
    roleCache = JSON.parse(tmp);
  }

  //check if action list is not empty
  if (roleCache.actions.length !== 0) {
    //find the corresponding resource in action list
    const entityDef = roleCache.actions.filter(
      (el) => el.entity === resource
    )[0];
    //check if the action is actually found and if the action has a corresponding in crud object
    if (entityDef !== undefined && entityDef[actionCRUD] !== undefined) {
      return (
        //return true when the crud action is not none nor false
        entityDef[actionCRUD] !== "none" && entityDef[actionCRUD] !== false
      );
    }
  }

  //default case (action list is empty or action list does not contains the specified resource)
  //return true when default of the action is not none nor false
  return (
    roleCache.default[actionCRUD] !== "none" &&
    roleCache.default[actionCRUD] !== false
  );
}

//hardcoded check for user rights
function canDoDeprecated(userRole, resource, actionCRUD) {
  if (actionCRUD === "create") {
    if (userRole === "admin") return true;
    if (userRole === "provider") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return true;
    }
    if (userRole === "supplier") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return true;
    }
    if (userRole === "analyst") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return false;
    }
  }
  if (actionCRUD === "read") {
    if (userRole === "admin") return true;
    if (userRole === "provider") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return true;
    }
    if (userRole === "supplier") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return false;
    }
    if (userRole === "analyst") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return true;
    }
  }
  if (actionCRUD === "update") {
    if (userRole === "admin") return true;
    if (userRole === "provider") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return true;
    }
    if (userRole === "supplier") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return false;
    }
    if (userRole === "analyst") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return false;
    }
  }
  if (actionCRUD === "delete") {
    if (userRole === "admin") return true;
    if (userRole === "provider") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return true;
    }
    if (userRole === "supplier") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return false;
    }
    if (userRole === "analyst") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return false;
    }
  }
  return false;
}
