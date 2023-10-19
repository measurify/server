import React, { useEffect, useState } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import locale from "../../common/locale";
import IconRole from "../iconRole/iconRole";
import {
  put_generic,
  login,
  getPasswordStrength,
} from "../../services/http_operations";
import "../page/page.scss";
import { passwordStrength } from "check-password-strength";

export default function ProfilePage(params) {
  //save in status informations of profile
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [tenant, setTenant] = useState("");
  const [emailShow, setEmailShow] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [msgPass, setMsgPass] = useState("");
  const [msgEmail, setMsgEmail] = useState("");
  const [isError, setisError] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("user-role");
    const tenant = localStorage.getItem("user-tenant");
    const _email = localStorage.getItem("user-email");
    setUsername(username !== null ? username : "");
    setRole(role !== null ? role : "");
    setTenant(tenant !== null && tenant !== "" ? tenant : "-");
    setEmailShow(_email !== null ? _email : "");
  }, []);

  const submitPassword = async (e) => {
    e.preventDefault();
    if (oldPassword === "") {
      setMsgPass(locale().old_pass_empty);
      setisError(true);
      return;
    }
    if (password !== passwordConfirm) {
      setMsgPass(locale().pass_not_match);
      setisError(true);
      return;
    }
    if (password === "" || passwordConfirm === "") {
      setMsgPass(locale().pass_not_null);
      setisError(true);
      return;
    }

    let requiredStr;
    try {
      const res = await getPasswordStrength();
      requiredStr = res.response.data.passwordStrength;

      const pswDetails = passwordStrength(password);

      if (pswDetails.id < requiredStr) {
        setMsgPass(locale().stronger_password_required);
        setisError(true);
        return;
      }
    } catch (error) {
      console.error(error);
      //Required password strength cannot be acquired from the server, use the default
      requiredStr = 1;
    }

    try {
      await login(username, oldPassword, tenant !== "-" ? tenant : "", false);
    } catch (error) {
      setMsgPass(locale().old_pass_wrong);
      setisError(true);
      return;
    }
    const result = window.confirm(locale().pass_change_confirm);

    setisError(false);
    if (result) {
      try {
        const response = await put_generic(
          "users",
          { password: password },
          username
        );
        setOldPassword("");
        setPassword("");
        setPasswordConfirm("");
        if (response.response.status === 200) {
          setMsgPass(locale().password_changed);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();

    if (email === "" || emailConfirm === "") {
      setMsgEmail(locale().empty_email_error);
      setisError(true);
      return;
    }

    if (email !== emailConfirm) {
      setMsgEmail(locale().email_not_match);
      setisError(true);
      return;
    }
    if (email === emailShow) {
      setMsgEmail(locale().email_same_as_old);
      setisError(true);
      return;
    }
    const result = window.confirm(locale().email_change_confirm);
    if (result) {
      try {
        const response = await put_generic("users", { email: email }, username);

        if (response.response.status === 200) {
          setEmail("");
          setEmailConfirm("");
          localStorage.setItem("user-email", email);
          setEmailShow(email);

          setisError(false);
          setMsgEmail(locale().email_changed);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        {locale().welcome}&nbsp;<b>{username}</b>:&nbsp;
        {locale().profile_page_desc}
      </header>
      <main className="page-content">
        <Container fluid>
          <Row>
            <Col xs={1}>Username:&nbsp;</Col>
            <Col>
              <b>{username}</b>
            </Col>
          </Row>
          <Row>
            <Col xs={1}>{locale().role}</Col>
            <Col>
              {role}&nbsp;
              <IconRole role={role} />
            </Col>
          </Row>
          <Row>
            <Col xs={1}>{locale().email + " "}</Col>
            <Col>
              <b>{emailShow}</b>
            </Col>
          </Row>
          <Row>
            <Col xs={1}>{locale().tenant + " "}</Col>
            <Col>
              <b>{tenant}</b>
            </Col>
          </Row>
        </Container>
        <hr />
        <Container fluid>
          <Col>
            <Row>
              <b>Change password</b>
            </Row>
          </Col>

          <Row>
            <Col>
              <Form onSubmit={submitPassword}>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type={"password"}
                      onChange={(e) => {
                        e.preventDefault();
                        setOldPassword(e.target.value);
                      }}
                      value={oldPassword}
                      placeholder={locale().enter + " old password"}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type={"password"}
                      onChange={(e) => {
                        e.preventDefault();
                        setPassword(e.target.value);
                      }}
                      value={password}
                      placeholder={locale().enter + " new password"}
                    />
                    <Form.Text className="text-muted">
                      {locale().password_rules}
                    </Form.Text>
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type={"password"}
                      onChange={(e) => {
                        e.preventDefault();
                        setPasswordConfirm(e.target.value);
                      }}
                      value={passwordConfirm}
                      placeholder={locale().repeat + " new password"}
                      aria-describedby="passwordHelpBlock"
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Col>
                    <font
                      style={{
                        marginLeft: 5 + "px",
                        color: isError ? "red" : "black",
                      }}
                    >
                      {msgPass}
                    </font>
                  </Col>
                </Row>{" "}
                <Row>
                  <Col>
                    <Button variant="primary" type="submit">
                      {locale().submit}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
        <hr />
        <Container fluid>
          <Col>
            <Row>
              <b>Change email associated to the account</b>
            </Row>
          </Col>

          <Row>
            <Col>
              <Form onSubmit={submitEmail}>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      onChange={(e) => {
                        e.preventDefault();
                        setEmail(e.target.value);
                      }}
                      value={email}
                      placeholder={locale().enter + " new email"}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      onChange={(e) => {
                        e.preventDefault();
                        setEmailConfirm(e.target.value);
                      }}
                      value={emailConfirm}
                      placeholder={locale().repeat + " new email"}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Col>
                    <font
                      style={{
                        marginLeft: 5 + "px",
                        color: isError ? "red" : "black",
                      }}
                    >
                      {msgEmail}
                    </font>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button variant="primary" type="submit">
                      {locale().submit}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
}
