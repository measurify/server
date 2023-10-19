import { refreshToken } from "./http_operations";
import { LogOut } from "./misc_functions";

//convert the time indication from login function (format as "30m") into milliseconds
export function DurationToMilliSeconds() {
  let exp = localStorage.getItem("token-expiration-time");

  if (exp === null) return 300;
  if (exp.endsWith("h")) {
    return parseInt(exp.slice(0, -1)) * 60 * 60 * 1000;
  } else if (exp.endsWith("m")) {
    return parseInt(exp.slice(0, -1)) * 60 * 1000;
  } else if (exp.endsWith("s")) {
    return parseInt(exp.slice(0, -1)) * 1000;
  }
  //default case, right now the same as seconds
  else {
    return parseInt(exp.slice(0, -1)) * 1000;
  }
}

//calculate remaining seconds
export function TokenExpireSeconds() {
  const t0_str = localStorage.getItem("login-time");
  //case for login time not setted, return 0 seconds remaining
  if (t0_str === null || t0_str === undefined) return 0;

  const t0 = parseInt(t0_str, 10);
  const duration = DurationToMilliSeconds();
  const tokenExpireMillis = t0 + duration;

  return parseInt((tokenExpireMillis - Date.now()) / 1000, 10);
}

export async function AutorefreshToken(deltatime = 1000) {
  return setInterval(ValidateDuration, deltatime);
}

const ValidateDuration = async () => {
  const expireSec = TokenExpireSeconds();
  if (expireSec <= 0) {
    //session expired, automatically logout
    LogOut();
    window.location.replace("/");
    return;
  }
  if (expireSec <= 60) {
    try {
      await refreshToken();
    } catch (error) {
      console.error(error);
    }
    return;
  }
};
