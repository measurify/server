import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import { Button } from "react-bootstrap";

import "./navigation.scss";

import locale from "../../common/locale";
import { refreshToken } from "../../services/http_operations";

import fontawesome from "@fortawesome/fontawesome";
import {
  faTimes,
  faBars,
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserTag,
  faUser,
  faCheck,
} from "@fortawesome/fontawesome-free-solid";

import { pages, languages } from "../../config";
import { LanguageSelector } from "../languageSelector/languageSelector";

fontawesome.library.add(
  faTimes,
  faBars,
  faUserTie,
  faUserGraduate,
  faUserCog,
  faUserTag,
  faUser,
  faCheck
);

const NavigationComp = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const [username, setUsername] = useState<string>();
  const [role, setRole] = useState<string>();
  const [tenant, setTenant] = useState<string>();
  const [loginTime, setLoginTime] = useState<number>();
  const [tknExpTime, setTknExpTime] = useState<string>();
  const [keepLogged, setKeepLogged] = useState<string>();
  const [displayTime, setDisplayTime] = useState<string>("00:00");

  useEffect(() => {
    const username = localStorage.getItem("diten-username");
    const role = localStorage.getItem("diten-user-role");
    const tenant = localStorage.getItem("diten-user-tenant");
    const loginTime = localStorage.getItem("diten-login-time");
    const tokenExpiration = localStorage.getItem("diten-token-expiration-time");
    const keepLogged = localStorage.getItem("diten-logged-in");
    setUsername(username !== null ? username : "");
    setRole(role !== null ? role : "");
    setTenant(tenant !== null && tenant !== "" ? tenant : "-");
    setTknExpTime(tokenExpiration !== null ? tokenExpiration : "300m");
    setKeepLogged(keepLogged !== null ? keepLogged : "logout");
    setLoginTime(loginTime !== null ? parseInt(loginTime) : Date.now());

    setTimeout(() => {
      CalcEnding();
    }, 1000);
  }, [displayTime]);

  function logOut() {
    localStorage.clear();
    document.location.replace("/");
  }

  function renderIconRole() {
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
      const retryLoginTime = localStorage.getItem("diten-login-time");
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

    if (remainingSec < 60) {
      if (keepLogged === "keep") {
        refreshToken().then(() => {
          setLoginTime(undefined);
          return;
        });
      }
    }
    if (remainingSec <= 0) {
      localStorage.clear();
      setDisplayTime(locale().session_expired);
      window.location.replace("/");
      return;
    }

    const mins = Math.floor(remainingSec / 60);
    const secs = Math.floor(remainingSec % 60);
    setDisplayTime(mins + " : " + ("0" + secs).slice(-2));
  }

  function DurationToMilliSeconds() {
    let exp;
    if (tknExpTime === undefined) {
      const retryTokenExpiration = localStorage.getItem(
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

  return (
    <nav className="app-nav">
      <Button className="app-nav-opener" onClick={() => setIsOpened(!isOpened)}>
        {isOpened ? (
          <i className="fa fa-times" aria-hidden="true"></i>
        ) : (
          <i className="fa fa-bars" aria-hidden="true"></i>
        )}
      </Button>
      <hr />
      <div className="data-wrapper">
        <div>
          <h3>
            {locale().welcome + " "}
            <b>{username}</b>
          </h3>
          <h3>
            {locale().role + " "}
            {renderIconRole()}
          </h3>
          <h3>
            {locale().tenant + " "}
            <b>{tenant}</b>
          </h3>
          <h3>
            {displayTime !== locale().session_expired
              ? locale().session_expire_in + displayTime
              : displayTime}
          </h3>
          <h3>
            {locale().keep_logged}
            {"  "}

            {keepLogged === "keep" ? (
              <i
                className="fa fa-check"
                id="logged_icon_check"
                aria-hidden="true"
                style={{
                  width: 10 + "px",
                  height: 10 + "px",
                  marginRight: 2 + "px",
                }}
              ></i>
            ) : (
              <i
                className="fa fa-times"
                id="logged_icon_times"
                aria-hidden="true"
                style={{
                  width: 10 + "px",
                  height: 10 + "px",
                  marginRight: 2 + "px",
                }}
              ></i>
            )}
          </h3>
        </div>

        <br />

        <Button variant="outline-danger" onClick={() => logOut()}>
          {locale().logout}
        </Button>
        {languages.length > 1 && (
          <React.Fragment>
            <hr />
            <h2>
              <LanguageSelector />
            </h2>
          </React.Fragment>
        )}
      </div>
      <hr />
      <div className={`app-nav-wrapper ${isOpened ? "opened" : ""}`}>
        <div className="app-nav-links">
          <div className="app-nav-text">{locale().tools}</div>
          <hr />
          {Object.keys(pages).map((k) => {
            return (
              <NavLink
                to={`/` + k}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"
                key={k}
                onClick={() => setIsOpened(false)}
              >
                {k}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const Navigation = NavigationComp;

/*
Mass Operation navlink Fragment

 <hr />
          <NavLink
            to={`/massop`}
            className={(navData) => (navData.isActive ? "active" : "")}
            //activeClassName="active"
            key={`massop`}
            onClick={() => setIsOpened(false)}
          >
            Mass Operations
          </NavLink>

*/
