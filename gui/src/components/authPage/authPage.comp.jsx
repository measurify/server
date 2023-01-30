import React, { useState } from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import { login } from "../../services/http_operations";
import { SetRoleDefinition } from "../../services/userRolesManagement";
import { NavLink } from "react-router-dom";
import { languages } from "../../config";
import "./authPage.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { Form, Container, Row, Col } from "react-bootstrap";
const userRef = React.createRef();
const pswRef = React.createRef();
const tenantRef = React.createRef();

const _tenant = "think-before-tenant";
//const _tenant = "";

const AuthPageComp = () => {
  //const { location, replace } = useHistory();
  const [msg, setMsg] = useState("");

  async function submitForm(e) {
    e.preventDefault();

    const user = userRef.current.value;
    const psw = pswRef.current.value;
<<<<<<< HEAD
    const tenant = _tenant;

=======
    const tenant = tenantRef.current.value;
    if (user === "") {
      setMsg("Please, insert your username");
      return;
    }
    if (psw === "") {
      setMsg("Please, insert your password");
      return;
    }
>>>>>>> fresta
    try {
      await login(user, psw, tenant);
      await SetRoleDefinition();
      window.location.replace("/");
    } catch (error) {
      console.log({ error: error.response.data });
      setMsg(error.response.data.message + " : " + error.response.data.details);
    }
  }

  return (
    <div className="auth-page">
      <div className="title-wrapper">
        <div className="title-section">Pensaci Prima</div>
      </div>
      {languages.length > 1 && (
        <div className="language-wrapper">
          <LanguageSelector />
        </div>
      )}

      <br />
      <br />
      <Form onSubmit={submitForm} className="rounded p-4 p-sm-3">
        <h4>{locale().login}</h4>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>{locale().username}</Form.Label>
          <Form.Control
            ref={userRef}
            type="text"
            placeholder={locale().username_suggestion}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>{locale().password}</Form.Label>
          <Form.Control
            type="password"
            ref={pswRef}
            placeholder={locale().password_suggestion}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          {locale().submit}
        </Button>
      </Form>
      <br />
      <div style={{ color: "red" }}>{msg}</div>
    </div>
  );
};

export const AuthPage = AuthPageComp;
