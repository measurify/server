import React, { useState } from "react";
import { Button } from "react-bootstrap";
import locale from "../../common/locale";
import { requestPasswordReset } from "../../services/http_operations";
import { languages } from "../../config";
import "../authPage/authPage.scss";
import { LanguageSelector } from "../languageSelector/languageSelector";
import { Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const emailRef = React.createRef();

const _tenant = "think-before-tenant";

export default function PasswordRecoveryPage() {
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
    const tenant = _tenant;

    if (email === "") {
      setMsg(locale().missing_email);
      return;
    }
    try {
      await requestPasswordReset(tenant, email);

      setMsg(locale().email_sent_successfully);
    } catch (error) {
      console.log({ error: error.response.data });

      setMsg(locale().email_sent_errors);
      //setMsg(error.response.data.message + " : " + error.response.data.details);
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
                <div style={{ color: "black" }}>{msg}</div>
              </Col>
            </Row>
          </Container>
        </Form>

        <br />
      </div>
    </div>
  );
}
