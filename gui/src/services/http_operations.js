import { api_url } from "../config";

const axios = require("axios").default;

const https = require("https");

const instance = axios.create({
  httpsAgent: new https.Agent({
    //unsafe, delete in prod
    //rejectUnauthorized: false,
  }),
});

export let notificationManager = {
  PushNotification: (obj) => {},
  RemoveNotification: (id) => {},
  ClearNotifications: () => {},
};

//login
export function login(username, password, tenant) {
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
        localStorage.setItem("diten-token", response.data.token);
        localStorage.setItem(
          "diten-token-expiration-time",
          response.data.token_expiration_time
        );
        localStorage.setItem("diten-username", response.data.user.username);
        localStorage.setItem("diten-user-role", response.data.user.type);
        localStorage.setItem("diten-user-tenant", tenant);
        localStorage.setItem(
          "diten-login-time",
          new Date().getTime().toString()
        );

        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//refresh token
export function refreshToken() {
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
        localStorage.setItem("diten-token", response.data.token);
        localStorage.setItem(
          "diten-login-time",
          new Date().getTime().toString()
        );
        localStorage.setItem(
          "diten-token-expiration-time",
          response.data.token_expiration_time
        );
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//this function post a single thing inside the DB
export function postThing(thingId, pt_options = {}) {
  const body = { _id: thingId };
  return new Promise((resolve, reject) => {
    post_generic("things", body, pt_options)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// This function checks if a thing (i.e., trip) is already in the DB
// If not in, create one
export function checkThingAlreadyIn(thingId) {
  const url = api_url + "/things/" + thingId;
  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "cache-control": "no-cache",
      Authorization: GetToken(),
    },
  };
  return new Promise((resolve, reject) => {
    instance
      .get(url, options)
      .then((request) => {
        //thing found in database
        if (request.status === 200) resolve({ found: true });
      })
      .catch((error) => {
        //thing not found in database
        if (error.response.status === 404) {
          resolve({ found: false });
        }
        /*else {
          reject(false);
        }*/
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

  console.log("POST file:" + url_string);

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

  console.log("POST :" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Authorization: token,
    },
  };
  console.log({ header: options, body: body, token: token });
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

  console.log("PUT :" + url_string);

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
  console.log("DELETE :" + url_string);

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

  console.log("GET :" + url);

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
        /*commons.PushMsg({
          type: "error",
          msg:
            "Error getting resource(s) of type: " +
            resource_type +
            ", with filter: " +
            qs.limit +
            ". " +
            error.message,
        });*/
        reject({ error: error });
      });
  });
}

//return the login token from the localstorage
function GetToken() {
  return localStorage.getItem("diten-token");
}
