import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import { Button } from "react-bootstrap";

import "./navigation.scss";

import locale from "../../common/locale";
import { LogOut } from "../../services/misc_functions";

import {
  languages,
  website_name,
  show_left_bar_details,
} from "../../configManager";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { canDo } from "../../services/userRolesManagement";
import { Capitalize } from "../../services/misc_functions";
import { AccessiblePages } from "../../services/userRolesManagement";
let role = React.createRef();
let username = React.createRef();
let tenant = React.createRef();

export default function Navigation() {
  const [isOpened, setIsOpened] = useState(false);

  const usr = localStorage.getItem("username");
  const rl = localStorage.getItem("user-role");
  const tn = localStorage.getItem("user-tenant");
  username.current = usr !== null ? usr : "";
  role.current = rl !== null ? rl : "";
  tenant.current = tn !== null && tn !== "" ? tn : "-";

  function renderIconRole() {
    if (role.current === "admin") {
      return (
        <React.Fragment>
          {Capitalize(role.current)}{" "}
          <i className="fa fa-user-tie" aria-hidden="true" title="Admin"></i>
        </React.Fragment>
      );
    } else if (role.current === "provider") {
      return (
        <React.Fragment>
          {Capitalize(role.current)}{" "}
          <i
            className="fa fa-user-graduate"
            aria-hidden="true"
            title="Provider"
          ></i>
        </React.Fragment>
      );
    } else if (role.current === "analyst") {
      return (
        <React.Fragment>
          {Capitalize(role.current)}{" "}
          <i className="fa fa-user-cog" aria-hidden="true" title="Analyst"></i>
        </React.Fragment>
      );
    } else if (role.current === "supplier") {
      return (
        <React.Fragment>
          {Capitalize(role.current)}{" "}
          <i className="fa fa-user-tag" aria-hidden="true" title="Supplier"></i>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {Capitalize(role.current)}{" "}
          <i className="fa fa-user" aria-hidden="true" aria-label="User"></i>
        </React.Fragment>
      );
    }
  }
  const {
    count,
    numAccessibleResources,
    accessibleResources,
    numAccessibleOperations,
    accessibleOperations,
  } = AccessiblePages();
  return (
    <nav className="app-nav">
      <Button className="app-nav-opener" onClick={() => setIsOpened(!isOpened)}>
        {isOpened ? (
          <i className="fa fa-times" aria-hidden="true"></i>
        ) : (
          <i className="fa fa-bars" aria-hidden="true"></i>
        )}
      </Button>
      <NavLink to="/home" className="nav-wrap">
        {website_name}
      </NavLink>
      <hr />
      <div className={`app-nav-wrapper ${isOpened ? "opened" : ""}`}>
        <div className="app-nav-links">
          <hr />
          <div className="data-wrapper">
            <NavLink to={`/viewProfile/`} key={`viewProfile`}>
              {locale().welcome + " "}
              <b>{username.current}</b>
            </NavLink>
            {show_left_bar_details === true && (
              <React.Fragment>
                <div style={{ paddingLeft: 10 + "px" }}>
                  <h3>
                    {locale().role + ": "}
                    {renderIconRole()}
                  </h3>
                </div>
                <div style={{ paddingLeft: 10 + "px" }}>
                  <h3>
                    {locale().tenant + " "}
                    <b>{tenant.current}</b>
                  </h3>
                </div>
              </React.Fragment>
            )}
            <br />
            <div style={{ paddingLeft: 20 + "px", paddingBottom: 20 + "px" }}>
              <Button variant="outline-danger" onClick={() => LogOut()}>
                {locale().logout}
              </Button>
            </div>
            {languages.length > 1 && (
              <React.Fragment>
                <hr />
                <h2>
                  <LanguageSelector />
                </h2>
              </React.Fragment>
            )}
          </div>
          {count !== 1 && numAccessibleResources !== 0 && (
            <React.Fragment>
              <hr />
              <div className="app-nav-text">{locale().resources}</div>
              <hr />
            </React.Fragment>
          )}

          {accessibleResources.map((k) => {
            return (
              <NavLink
                to={`/` + k}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"
                key={k}
                onClick={() => setIsOpened(false)}
              >
                {Capitalize(k)}
              </NavLink>
            );
          })}
          {count !== 1 && numAccessibleOperations !== 0 && (
            <React.Fragment>
              <hr />
              <div className="app-nav-text">{locale().tools}</div> <hr />
            </React.Fragment>
          )}

          {count !== 1 &&
            accessibleOperations.includes("updatehistory") &&
            canDo(role.current, "experiments", "update") && (
              <NavLink
                to={`/updatehistory`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Update Experiment History
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("downloadexperiment") &&
            canDo(role.current, "experiments", "read") && (
              <NavLink
                to={`/downloadexperiment`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Download Experiments Data
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("removesteps") &&
            canDo(role.current, "experiments", "update") && (
              <NavLink
                to={`/removesteps`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Remove History Steps
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("uploadquestionnaire") &&
            canDo(role.current, "measurements", "create") && (
              <NavLink
                to={`/uploadquestionnaire`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Upload Questionnaires
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("downloadquestionnaire") &&
            canDo(role.current, "measurements", "get") && (
              <NavLink
                to={`/downloadquestionnaire`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Download Questionnaires
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("kpi") &&
            canDo(role.current, "measurements", "create") && (
              <NavLink
                to={`/kpi`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                KPI
              </NavLink>
            )}

          {count !== 1 &&
            accessibleOperations.includes("viewkpis") &&
            canDo(role.current, "measurements", "read") &&
            canDo(role.current, "measurements", "update") && (
              <NavLink
                to={`/viewkpis`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                View KPIs
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("viewaggregatedkpis") &&
            canDo(role.current, "measurements", "read") && (
              <NavLink
                to={`/viewaggregatedkpis`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                View Aggregated KPIs
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("downloadkpis") &&
            canDo(role.current, "measurements", "read") && (
              <NavLink
                to={`/downloadkpis`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Download KPIs
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("uploadmeasurements") &&
            canDo(role.current, "measurements", "create") && (
              <NavLink
                to={`/uploadmeasurements`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Upload Measurements
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("downloadmeasurements") &&
            canDo(role.current, "measurements", "read") && (
              <NavLink
                to={`/downloadmeasurements`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Download Measurements
              </NavLink>
            )}
          {count !== 1 &&
            accessibleOperations.includes("downloadtimeseries") &&
            canDo(role.current, "measurements", "read") && (
              <NavLink
                to={`/downloadtimeseries`}
                className={(navData) => (navData.isActive ? "active" : "")}
                //activeClassName="active"}
                onClick={() => setIsOpened(false)}
              >
                Download Timeseries
              </NavLink>
            )}
        </div>
      </div>
    </nav>
  );
}
