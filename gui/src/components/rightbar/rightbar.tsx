import React, { useState, useEffect } from "react";

import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";
import { Button } from "../button/button.comp";
import locale from "../../common/locale";

import "./rightbar.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";

import fontawesome from "@fortawesome/fontawesome";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserTag,
  faUser,
} from "@fortawesome/fontawesome-free-solid";

fontawesome.library.add(
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserTag,
  faUser
);

interface IProps {
  context: IAppContext;
}

const RightBarComp = ({ context: { config } }: IProps) => {
  const [username, setUsername] = useState<string>();
  const [role, setRole] = useState<string>();
  const [tenant, setTenant] = useState<string>();
  const [loginTime, setLoginTime] = useState<number>();
  const [tknExpTime, setTknExpTime] = useState<string>();
  const [displayTime, setDisplayTime] = useState<string>("00:00");

  function logOut() {
    sessionStorage.clear();
    document.location.replace("/");
  }

  function renderIcon() {
    if (role === "admin") {
      return (
        <i className="fa fa-user-tie" aria-hidden="true" title="Admin"></i>
      );
    } else if (role === "provider") {
      return (
        <i
          className="fa fa-user-graduate"
          aria-hidden="true"
          title="Provider"
        ></i>
      );
    } else if (role === "analyst") {
      return (
        <i className="fa fa-user-cog" aria-hidden="true" title="Analyst"></i>
      );
    } else if (role === "supplier") {
      return (
        <i className="fa fa-user-tag" aria-hidden="true" title="Supplier"></i>
      );
    } else {
      return (
        <i className="fa fa-user" aria-hidden="true" aria-label="User"></i>
      );
    }
  }

  function CalcEnding() {
    let t0;
    if (loginTime === undefined) {
      const retryLoginTime = sessionStorage.getItem("diten-login-time");
      if (retryLoginTime !== null) {
        t0 = parseInt(retryLoginTime);

        setLoginTime(parseInt(retryLoginTime));
      } else {
        t0 = Date.now();
      }
    } else {
      t0 = loginTime;
    }
    const duration = DurationToMilliSeconds();
    const endTime = t0 + duration;

    let remainingSec = (endTime - Date.now()) / 1000;
    remainingSec = remainingSec > 0 ? remainingSec : 0;

    const mins = Math.floor(remainingSec / 60);
    const secs = Math.floor(remainingSec % 60);
    setDisplayTime(mins + " : " + ("0" + secs).slice(-2));
  }

  function DurationToMilliSeconds() {
    let exp;
    if (tknExpTime === undefined) {
      const retryTokenExpiration = sessionStorage.getItem(
        "diten-token-expiration-time"
      );
      if (retryTokenExpiration !== null) {
        exp = retryTokenExpiration;
        setTknExpTime(retryTokenExpiration);
      } else {
        exp = "5m";
      }
    } else {
      exp = tknExpTime;
    }
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

  useEffect(() => {
    const username = sessionStorage.getItem("diten-username");
    const role = sessionStorage.getItem("diten-user-role");
    const tenant = sessionStorage.getItem("diten-user-tenant");
    const loginTime = sessionStorage.getItem("diten-login-time");
    const tokenExpiration = sessionStorage.getItem(
      "diten-token-expiration-time"
    );
    setUsername(username !== null ? username : "");
    setRole(role !== null ? role : "");
    setTenant(tenant !== null && tenant !== "" ? tenant : "-");
    setTknExpTime(tokenExpiration !== null ? tokenExpiration : "300m");
    setLoginTime(loginTime !== null ? parseInt(loginTime) : Date.now());

    setTimeout(() => {
      CalcEnding();
    }, 1000);
  }, [displayTime]);
  return (
    <div className="rightbar">
      <h2>
        {locale().welcome + " "}
        <b>{username}</b>
        <br />
        {locale().role + " "}
        {renderIcon()}
      </h2>
      <h3>
        {locale().tenant + " "}
        <b>{tenant}</b>
        <br />
        {locale().session_expire_in}
        {displayTime}
      </h3>
      <hr />
      <h2>
        <LanguageSelector />
      </h2>
      <br />
      <hr />
      <div className="logout-wrapper">
        <Button color="red" onClick={() => logOut()}>
          {locale().logout}
        </Button>
      </div>
    </div>
  );
};

export const RightBar = withAppContext(RightBarComp);
