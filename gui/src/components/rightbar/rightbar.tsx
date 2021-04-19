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

  function logOut() {
    sessionStorage.clear();
    document.location.replace("/");
  }

  function renderIcon() {
    console.log(role);
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
  useEffect(() => {
    const username = sessionStorage.getItem("diten-username");
    const role = sessionStorage.getItem("diten-user-role");
    const tenant = sessionStorage.getItem("diten-user-tenant");
    setUsername(username !== null ? username : "");
    setRole(role !== null ? role : "");
    setTenant(tenant !== null && tenant !== "" ? tenant : "-");

    console.log(tenant);
  });
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
        XX:XX
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
