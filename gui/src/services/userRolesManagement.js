//check if an user is allowed to do a specific action
//hardcoder for now, will be implemented through roles route
export const canDo = (userRole, resource, action) => {
  if (action === "create") {
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
  if (action === "read") {
    if (userRole === "admin") return true;
    if (userRole === "provider") {
      if (resource === "users") return false;
      if (resource === "protocols") return true;
      if (resource === "experiments") return true;
    }
    if (userRole === "supplier") {
      if (resource === "users") return false;
      if (resource === "protocols") return false;
      if (resource === "experiments") return false;
    }
    if (userRole === "analyst") {
      if (resource === "users") return false;
      if (resource === "protocols") return true;
      if (resource === "experiments") return true;
    }
  }
  if (action === "update") {
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
  if (action === "delete") {
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
};
