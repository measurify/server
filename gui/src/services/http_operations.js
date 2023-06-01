import { api_url } from "../config";

import axios from "axios";

export const instance = axios.create({});

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
  if (qs.sort !== undefined && qs.sort.by !== "") {
    url = url.concat(
      '&sort={"' +
        qs.sort.by +
        '":' +
        (qs.sort.order === "ascending" ? '"asc"' : '"desc"') +
        "}"
    );
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

export async function get_generic_pipe(resource_type, qs = {}, token) {
  let url = api_url + "/" + resource_type + "/pipe/";
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

  console.log("GET PIPE:" + url);

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
        resolve(response);
      })
      .catch((error) => {
        console.log(error);
        reject({ error: error });
      });
  });
}

export async function get_one_generic(resource_type, id, token) {
  let url = api_url + "/" + resource_type + "/" + id;
  if (token === undefined) token = GetToken();

  console.log("GET ONE:" + url);

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

//return the login token from the localstorage
function GetToken() {
  return localStorage.getItem("token");
}

//get location from bigDataCloud APIs
export function getBigDataCloudLocation(latitude, longitude) {
  const options = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const url =
    "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
    latitude +
    "&longitude=" +
    longitude +
    "&localityLanguage=it";
  console.log("GET location: " + url);
  return new Promise((resolve, reject) => {
    instance
      .get(url, options)
      .then((res) => {
        //set response into localStorage (it will be cleared on logout)
        localStorage.setItem("continent", res.data.continent);
        localStorage.setItem("continentCode", res.data.continentCode);
        localStorage.setItem("countryName", res.data.countryName);
        localStorage.setItem("countryCode", res.data.countryCode);
        localStorage.setItem(
          "principalSubdivision",
          res.data.principalSubdivision
        );
        localStorage.setItem("city", res.data.city);
        localStorage.setItem("locality", res.data.locality);

        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//function to request a password reset
export async function requestPasswordReset(tenant, email) {
  console.log({ email, tenant });

  const url_string = api_url + "/self/reset?tenant=" + tenant;
  const body = JSON.stringify({ email: email });
  console.log("POST password reset request:" + url_string);
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
  console.log("PUT password reset:" + url_string);
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
  console.log("GET password strength:" + url_string);

  const options = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  };
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
}
