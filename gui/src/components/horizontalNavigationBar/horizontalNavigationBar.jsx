import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import { Button, Container, Row, Col } from "react-bootstrap";
import NotificationBar from "../notificationBar/notificationBar";
import "./horizontalNavigationBar.scss";

import locale from "../../common/locale";
import { LogOut } from "../../services/misc_functions";

import { pages, languages, website_name } from "../../configManager";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { canDo } from "../../services/userRolesManagement";
import { Capitalize } from "../../services/misc_functions";

let role = React.createRef();
let username = React.createRef();
let tenant = React.createRef();

export default function HorizontalNavigationBar() {
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
        <i className="fa fa-user-tie" aria-hidden="true" title="Admin"></i>
      );
    } else if (role.current === "provider") {
      return (
        <i
          className="fa fa-user-graduate"
          aria-hidden="true"
          title="Provider"
        ></i>
      );
    } else if (role.current === "analyst") {
      return (
        <i className="fa fa-user-cog" aria-hidden="true" title="Analyst"></i>
      );
    } else if (role.current === "supplier") {
      return (
        <i className="fa fa-user-tag" aria-hidden="true" title="Supplier"></i>
      );
    } else {
      return (
        <i className="fa fa-user" aria-hidden="true" aria-label="User"></i>
      );
    }
  }

  return (
    <nav className="horizontal-nav">
      <div className="horizontal-nav-links">
        <div className="data-wrapper">
          <Container fluid>
            <Row style={{ padding: 0 }}>
              <Col>
                <NavLink to="/home" className="nav-wrap">
                  {website_name}
                </NavLink>
              </Col>
              <Col>
                <NavLink to={`/viewProfile/`} key={`viewProfile`}>
                  {locale().welcome + " "}
                  <b>{username.current}</b>
                </NavLink>
              </Col>
              <Col>
                <div className="horizontal-nav-text">
                  {locale().role + " "}
                  {renderIconRole()}
                </div>
              </Col>
              <Col>
                <div className="horizontal-nav-text">
                  {locale().tenant + " "}
                  <b>{tenant.current}</b>
                </div>
              </Col>
              <Col>
                <Button variant="outline-danger" onClick={() => LogOut()}>
                  {locale().logout}
                </Button>
              </Col>

              {languages.length > 1 && (
                <Col>
                  <LanguageSelector />
                </Col>
              )}
              <Col>
                <NotificationBar />
              </Col>
            </Row>
            <Row style={{ padding: 0 }}>
              <hr />
              <div
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "flex-start",
                }}
              >
                {locale().resources}
              </div>
            </Row>
            <Row style={{ padding: 0 }}>
              {React.Children.toArray(
                Object.keys(pages).map((k) => {
                  //check if user can access to the page
                  if (!canDo(role.current, k, "read")) {
                    return "";
                  }
                  return (
                    <Col>
                      <NavLink
                        to={`/` + k}
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                        //activeClassName="active"
                        key={k}
                        onClick={() => setIsOpened(false)}
                      >
                        {Capitalize(k)}
                      </NavLink>
                    </Col>
                  );
                })
              )}
            </Row>
          </Container>
        </div>
      </div>
    </nav>
  );
}
