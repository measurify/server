import { base_api_url } from "../configManager";
import { logsManager } from "./operation_tool_services";
import axios from "axios";

export let api_url;

export const instance = axios.create({});

export let notificationManager = {
  PushNotification: (obj) => {},
  RemoveNotification: (id) => {},
  ClearNotifications: () => {},
};

//set APIs url according to configuration or GUI host
export function SetAPIUrl() {
  api_url =
    base_api_url !== undefined ? base_api_url : window.location.origin + "/v1";
}

//login
export async function login(username, password, tenant, saveToken = true) {
  const body = {
    username: `${username}`,
    password: `${password}`,
    tenant: `${tenant}`,
  };
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      //Authorization: GetToken(),
    },
  };

  const url_string = api_url + "/login";

  return new Promise((resolve, reject) => {
    instance
      .post(url_string, body, options)
      .then((response) => {
        if (saveToken === true) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "token-expiration-time",
            response.data.token_expiration_time
          );
          localStorage.setItem("username", response.data.user.username);
          localStorage.setItem("user-role", response.data.user.type);
          localStorage.setItem("user-email", response.data.user.email);
          localStorage.setItem("user-tenant", tenant);
          localStorage.setItem("login-time", new Date().getTime().toString());
        }
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//refresh token
export async function refreshToken() {
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: GetToken(),
    },
  };

  const url_string = api_url + "/login";

  return new Promise((resolve, reject) => {
    instance
      .put(url_string, {}, options)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("login-time", new Date().getTime().toString());
        localStorage.setItem(
          "token-expiration-time",
          response.data.token_expiration_time
        );
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function post_file_generic(
  resource_type,
  formData,
  additionalHeader = {},
  token = undefined
) {
  if (token === undefined) token = GetToken();
  const url_string = api_url + "/" + resource_type + "/file";

  console.debug("POST file:" + url_string);

  const tempH = {
    "Content-Type": "multipart/form-data",
    "Cache-Control": "no-cache",
    Authorization: token,
  };

  Object.entries(additionalHeader).forEach(([k, v]) => {
    tempH[k] = v;
  });
  const options = {
    headers: tempH,
  };

  return new Promise((resolve, reject) => {
    instance
      .post(url_string, formData, options)
      .then((response) => {
        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg: "Successful POST of file on: " + resource_type,
        });

        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg: "Error doing a POST of file on: " + resource_type,
        });
        reject({ error: error }); //false;
      });
  });
}

export async function post_generic(resource_type, body, token = undefined) {
  if (token === undefined) token = GetToken();
  const url_string = api_url + "/" + resource_type + "/";

  console.debug("POST :" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .post(url_string, body, options)
      .then((response) => {
        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg: "Successful POST of a resource type: " + resource_type,
        });

        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg: "Error doing a POST of a resource type: " + resource_type,
        });
        reject({ error: error }); //false;
      });
  });
}

export async function put_generic(resource_type, body, id, token = undefined) {
  const url_string = api_url + "/" + resource_type + "/" + id;
  if (token === undefined) token = GetToken();

  console.debug("PUT :" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .put(url_string, body, options)
      .then((response) => {
        //obscure password in notification bar
        if (body["password"] !== undefined)
          body["password"] = "".padStart(body["password"].length, "*");

        notificationManager.PushNotification({
          name: "info",
          time: new Date().toTimeString(),
          msg:
            "Successful PUT of a resource type: " +
            resource_type +
            ", id: " +
            id +
            ", body: " +
            JSON.stringify(body),
        });

        resolve({ response: response }); //true;
      })
      .catch((error) => {
        //obscure password in notification bar
        if (body["password"] !== undefined)
          body["password"] = "".padStart(body["password"].length, "*");

        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg:
            "Error doing a PUT on resource type: " +
            resource_type +
            ", id: " +
            id +
            ", body: " +
            JSON.stringify(body) +
            ". " +
            error.message,
        });

        reject({ error: error }); //false;
      });
  });
}

export async function delete_generic(resource_type, id, token = undefined) {
  let url_string = api_url + "/" + resource_type;
  if (token === undefined) token = GetToken();
  if (id !== undefined) {
    url_string += "/" + id;
  }
  console.debug("DELETE :" + url_string);

  //url: url_string;
  let options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };

  return new Promise((resolve, reject) => {
    instance
      .delete(url_string, options)
      .then((response) => {
        if (id !== undefined) {
          notificationManager.PushNotification({
            name: "info",
            time: new Date().toTimeString(),
            msg: "Deleted resource: " + id + ", of type: " + resource_type,
          });
        } else {
          notificationManager.PushNotification({
            name: "info",
            time: new Date().toTimeString(),
            msg: "Deleted resources of type: " + resource_type,
          });
        }
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        notificationManager.PushNotification({
          name: "error",
          time: new Date().toTimeString(),
          msg:
            "error deleting resource: " +
            id +
            ", of type: " +
            resource_type +
            ". " +
            error.message,
        });
        if (error.statusCode === 404) {
          //Not found
          notificationManager.PushNotification({
            name: "error",
            time: new Date().toTimeString(),
            msg:
              "Please check if your user is authorized to delete the resource. " +
              error.message,
          });
        }

        reject({ error: error }); //false;
      });
  });
}

export async function get_generic(resource_type, qs = {}, token) {
  let url = api_url + "/" + resource_type + "/";
  if (token === undefined) token = GetToken();

  if (qs.filter !== undefined) {
    url = url.concat("?filter=" + qs.filter);
  } else {
    url = url.concat("?filter=");
  }
  if (qs.limit !== undefined) {
    url = url.concat("&limit=" + qs.limit);
  }
  if (qs.page !== undefined) {
    url = url.concat("&page=" + qs.page);
  }
  if (qs.select !== undefined && qs.length !== 0) {
    url = url.concat('&select=["' + qs.select.join('","') + '"]');
  }
  if (qs.sort !== undefined) {
    url = url.concat("&sort=" + qs.sort);
  }

  console.debug("GET :" + url);

  let options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },

    json: true,
  };

  return new Promise((resolve, reject) => {
    instance
      .get(url, options)
      .then((response) => {
        resolve({
          response: response,
          docs: response.data.docs,
          totalDocs: response.data.totalDocs,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          page: response.data.page,
          pagingCounter: response.data.pagingCounter,
          hasPrevPage: response.data.hasPrevPage,
          hasNextPage: response.data.hasNextPage,
          prevPage: response.data.prevPage,
          nextPage: response.data.nextPage,
        });
      })
      .catch((error) => {
        reject({ error: error });
      });
  });
}

export async function get_one_generic(resource_type, id, token) {
  let url = api_url + "/" + resource_type + "/" + id;
  if (token === undefined) token = GetToken();

  console.debug("GET ONE:" + url);

  let options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },

    json: true,
  };
  return new Promise((resolve, reject) => {
    instance
      .get(url, options)
      .then((response) => {
        resolve({
          response: response,
        });
      })
      .catch((error) => {
        reject({ error: error });
      });
  });
}

//function to request a password reset
export async function requestPasswordReset(tenant, email) {
  const url_string = api_url + "/self/reset?tenant=" + tenant;
  const body = JSON.stringify({ email: email });
  console.debug("POST password reset request:" + url_string);
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .post(url_string, body, options)
      .then((response) => {
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        reject({ error: error }); //false;
      });
  });
}

//function to reset the password from token
export async function resetPassword(tenant, token, password) {
  const url_string = api_url + "/self";
  console.debug("PUT password reset:" + url_string);
  const body = JSON.stringify({
    reset: token,
    password: password,
    tenant: tenant,
  });
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .put(url_string, body, options)
      .then((response) => {
        resolve({ response: response }); //true;
      })
      .catch((error) => {
        reject({ error: error }); //false;
      });
  });
}

//get required password strength from the API
export async function getPasswordStrength() {
  const url_string = api_url + "/types/passwordStrength";
  console.debug("GET password strength:" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
  try {
    return new Promise((resolve, reject) => {
      instance
        .get(url_string, options)
        .then((response) => {
          resolve({ response: response }); //true;
        })
        .catch((error) => {
          reject({ error: error }); //false;
        });
    });
  } catch (error) {
    console.debug(error);
    return { error: error };
  }
}
//return the login token from the localstorage
export function GetToken() {
  return localStorage.getItem("token");
}

//post measurements csv file with the description file
export async function postCsvFile(file, csvDescription, force = true) {
  const descFile = new File(
    [JSON.stringify(csvDescription, null, 4)],
    "description.json",
    {
      type: "application/json",
    }
  );
  console.log(descFile);
  const data = new FormData();
  data.append("file", file);
  data.append("description", descFile);

  let url = api_url + "/measurements/file";
  if (force === true) url += "?force=true";
  const tempH = {
    "Content-Type": "multipart/form-data",
    "Cache-Control": "no-cache",
    Authorization: GetToken(),
  };
  const options = {
    headers: tempH,
  };

  try {
    const response = await instance.post(url, data, options);

    logsManager.PushLog({
      type: "info",
      msg:
        file.name +
        ", successfully posted " +
        response.data.completed.length +
        " rows, with " +
        response.data.errors.length +
        " errors\n",
    });
    return response;
  } catch (error) {
    console.debug(error);

    logsManager.PushLog({
      type: "error",
      msg: "Failed to post: " + file.name + "\n",
    });
    return error.response;
  }
}

//post measurements csv file with the description file
export async function postCsvFileWithDescriptionFile(
  file,
  description,
  force = true
) {
  const data = new FormData();
  data.append("file", file);
  data.append("description", description);

  let url = api_url + "/measurements/file";
  if (force === true) url += "?force=true";
  const tempH = {
    "Content-Type": "multipart/form-data",
    "Cache-Control": "no-cache",
    Authorization: GetToken(),
  };
  const options = {
    headers: tempH,
  };

  try {
    const response = await instance.post(url, data, options);
    logsManager.PushLog({
      type: "info",
      msg:
        file.name +
        ", successfully posted " +
        response.data.completed.length +
        " row, with " +
        response.data.errors.length +
        " errors\n",
    });
    if (response.data.errors.length !== 0) {
      response.data.errors.forEach((e) => {
        logsManager.PushLog({
          type: "error",
          msg: e + " \n",
        });
      });
    }
    return response;
  } catch (error) {
    console.log(error);

    logsManager.PushLog({
      type: "error",
      msg: "Failed to post: " + file.name + "\n",
    });
    logsManager.PushLog({
      type: "error",
      msg: "Message: " + error.response.data.message + " \n",
    });
    logsManager.PushLog({
      type: "error",
      msg: "Details: " + error.response.data.details + " \n",
    });
    return error.response;
  }
}
