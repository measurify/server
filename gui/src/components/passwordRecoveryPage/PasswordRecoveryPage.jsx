import React, { useState } from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import { requestPasswordReset } from "../../services/http_operations";
import { languages } from "../../configManager";
import "../authPage/authPage.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { Form, Container, Row, Col } from "react-bootstrap";
import LogoHolder from "../logoHolder/logoHolder";
import { useNavigate } from "react-router-dom";
const emailRef = React.createRef();
const tenantRef = React.createRef();

export default function PasswordRecoveryPage({ tenants }) {
  //const { location, replace } = useHistory();
  const [msg, setMsg] = useState("");

  //redirect hook
  const navigate = useNavigate();

  const back = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  async function submitForm(e) {
    e.preventDefault();

    const email = emailRef.current.value;

    const tenant = tenants.length === 1 ? tenants[0] : tenantRef.current.value;

    if (tenant === "") {
      setMsg(locale().missing_tenant);
      return;
    }
    if (email === "") {
      setMsg(locale().missing_email);
      return;
    }
    try {
      const resp = await requestPasswordReset(tenant, email);
      if (resp.response.status === 200)
        setMsg(locale().email_sent_successfully);
      else setMsg(locale().email_sent_errors);
    } catch (error) {
      console.error({ error: error.response.data });
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
                <h4>{locale().password_recovery}</h4>
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
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>{locale().email}</Form.Label>
                  <Form.Control
                    type="email"
                    ref={emailRef}
                    placeholder={locale().email_suggestion}
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
                <Button variant="secondary" onClick={back}>
                  {locale().cancel}
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
