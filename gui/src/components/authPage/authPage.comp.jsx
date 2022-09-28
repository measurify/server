import React, { useState } from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import { login } from "../../services/http_operations";
import { NavLink } from "react-router-dom";
import { languages } from "../../config";
import "./authPage.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";

const AuthPageComp = () => {
  //const { location, replace } = useHistory();
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [tenant, setTenant] = useState("");
  const [logged, setLogged] = useState(true);
  const [msg, setMsg] = useState("");

  async function submitForm(e) {
    e.preventDefault();

    try {
      const res = await login(user, pwd, tenant);
      if (logged === true) localStorage.setItem("diten-logged-in", "keep");
      else localStorage.setItem("diten-logged-in", "logout");
      window.location.replace("/");
    } catch (error) {
      console.log({ error: error.response.data });
      setMsg(error.response.data.message + " : " + error.response.data.details);
    }
  }

  function handleUserChange(event) {
    setUser(event.target.value);
  }

  function handlePwdChange(event) {
    setPwd(event.target.value);
  }

  function handleTenantChange(event) {
    setTenant(event.target.value);
  }

  return (
    <div className="auth-page">
      <div className="title-wrapper">
        <div className="title-section">Measurify</div>
        <br />
        <div className="subtitle-section">From the edge to cloud and back</div>
      </div>
      {languages.length > 1 && (
        <div className="language-wrapper">
          <LanguageSelector />
        </div>
      )}

      <br />
      <br />
      <div className="login-section">
        <h4>{locale().login}</h4>
        <form className="form-content" onSubmit={submitForm}>
          <div className="form-row row">
            <label>{locale().username}</label>
            <input
              type="text"
              id="username"
              placeholder={locale().username_suggestion}
              onChange={handleUserChange}
            />
          </div>
          <div className="form-row row">
            <label>{locale().password}</label>
            <input
              type="password"
              id="password"
              placeholder={locale().password_suggestion}
              onChange={handlePwdChange}
            />
          </div>
          <div className="form-row row">
            <label>{locale().tenant}</label>
            <input
              type="text"
              id="tenant"
              placeholder={locale().tenant_suggestion}
              onChange={handleTenantChange}
            />
          </div>
          {/* <div className="form-row row">
            <label>{locale().keep_logged}</label>
            <input
              type="checkbox"
              id="logged"
              className="input-checkbox"
              checked={logged}
              onChange={(e) => {
                setLogged(e.target.checked);
              }}
            />
            </div>*/}
          <div className="buttons-wrapper center">
            <Button type="submit" variant="success">
              {locale().submit}
            </Button>
          </div>

          <br />
          <div style={{ color: "red" }}>{msg}</div>
          <br />
          <div className="form-row row">
            <NavLink to={`/add/tenants`}>
              <Button variant="outline-success" size="sm">
                {locale().add_tenant}
                <i
                  className="fa fa-plus-circle"
                  aria-hidden="true"
                  title={"Add"}
                  style={{
                    width: 30 + "px",
                    height: 30 + "px",
                    marginRight: 10 + "px",
                    opacity: 0.85,
                  }}
                ></i>
              </Button>
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AuthPage = AuthPageComp;
