import React, { useState } from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import {
  resetPassword,
  getPasswordStrength,
} from "../../services/http_operations";
import { SetRoleDefinition } from "../../services/userRolesManagement";
import { NavLink } from "react-router-dom";
import { languages } from "../../configManager";
import "../authPage/authPage.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { Form, Container, Row, Col } from "react-bootstrap";
import LogoHolder from "../logoHolder/logoHolder";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { passwordStrength } from "check-password-strength";
const tenantRef = React.createRef();
const pswRef = React.createRef();
const pswConfirmRef = React.createRef();

export default function PasswordResetPage({ tenants }) {
  //const { location, replace } = useHistory();
  const [msg, setMsg] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token"));

  //redirect hook
  const navigate = useNavigate();

  const go_login = () => {
    navigate("/");
  };

  async function submitForm(e) {
    e.preventDefault();

    let requiredStr;
    try {
      const res = await getPasswordStrength();
      requiredStr = res.response.data.passwordStrength;
    } catch (error) {
      console.error(error);
      //Required password strength cannot be acquired from the server, use the default
      requiredStr = 1;
    }

    const tenant = tenants.length === 1 ? tenants[0] : tenantRef.current.value;
    const psw = pswRef.current.value;
    const pswConfirm = pswConfirmRef.current.value;

    if (psw === "" || pswConfirm === "") {
      setMsg(locale().pass_not_null);
      return;
    }

    if (psw !== pswConfirm) {
      setMsg(locale().pass_not_match);
      return;
    }
    if (tenant === "") {
      setMsg(locale().missing_email);
      return;
    }
    if (token === "" || token == undefined) {
      setMsg(locale().missing_token);
      return;
    }
    const pswDetails = passwordStrength(psw);

    if (pswDetails.id < requiredStr) {
      setMsg(locale().stronger_password_required);
      return;
    }

    try {
      const resp = await resetPassword(tenant, token, psw);
      if (resp.response.status === 200) setMsg(locale().password_changed);
      else setMsg(locale().password_not_changed_errors);
    } catch (error) {
      console.error(error);
      if (error.error.message === "Network Error") {
        setMsg(locale().network_error);
        return;
      }
      setMsg(error.response.data.message + " : " + error.response.data.details);
    }
  }

  return (
    <div className="auth-page">
      <div className="title-wrapper">
        <LogoHolder />
      </div>
      {languages.length > 1 && (
        <div className="language-wrapper">
          <LanguageSelector />
        </div>
      )}
      <br />
      <br />
      <div className="login-section">
        <Form onSubmit={submitForm}>
          <Container fluid>
            <Row>
              <Col>
                <h4>{locale().password_reset}</h4>
              </Col>
            </Row>
            <Row>
              <Col>
                {tenants.length > 1 && (
                  <Form.Group className="mb-3" controlId="tenant">
                    <Form.Label>{locale().tenant}</Form.Label>
                    <Form.Select
                      aria-label={locale().tenant_suggestion}
                      ref={tenantRef}
                    >
                      {React.Children.toArray(
                        tenants.map((t) => {
                          return <option value={t}>{t}</option>;
                        })
                      )}
                    </Form.Select>
                  </Form.Group>
                )}
              </Col>
            </Row>{" "}
            {(searchParams.get("token") === null ||
              searchParams.get("token") === "") && (
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="token">
                    <Form.Label>Token</Form.Label>
                    <Form.Control
                      onChange={(e) => {
                        e.preventDefault();
                        setToken(e.target.value);
                      }}
                      type="text"
                      placeholder={locale().enter + " token"}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="tenant">
                  <Form.Label>{locale().password}</Form.Label>
                  <Form.Control
                    ref={pswRef}
                    type="password"
                    placeholder={locale().enter + " new password"}
                  />
                  <Form.Text className="text-muted">
                    {locale().password_rules}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Control
                    type="password"
                    ref={pswConfirmRef}
                    placeholder={locale().repeat + " new password"}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button variant="success" type="submit">
                  {locale().submit}
                </Button>{" "}
                &nbsp;&nbsp;&nbsp;
                <Button variant="secondary" onClick={go_login}>
                  {locale().go_login_page}
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <div style={{ color: "red" }}>{msg}</div>
              </Col>
            </Row>
          </Container>
        </Form>

        <br />
      </div>
    </div>
  );
}
