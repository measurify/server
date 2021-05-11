import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../button/button.comp";
import { ToastContainer, toast } from "react-toastify";
import { withAppContext } from "../withContext/withContext.comp";
import locale from "../../common/locale";
import { IAppContext } from "../app.context";
import "react-toastify/dist/ReactToastify.css";

import {
  IConfigPage,
  IConfigMethods,
  IConfigGetAllMethod,
  IConfigPostMethod,
  IConfigPutMethod,
  IConfigDeleteMethod,
  IConfigInputField,
  IConfigCustomAction,
  IConfigGetSingleMethod,
  ICustomLabels,
  IConfigPagination,
  IConfigGraphMethod,
} from "../../common/models/config.model";

import "./authPage.scss";
import { FormPopup } from "../formPopup/formPopup.comp";
import { LanguageSelector } from "../languageSelector/languageSelector";

interface IProps {
  context: IAppContext;
}

interface IPopupProps {
  type: "add";
  title: string;
  config: IConfigPostMethod | IConfigPutMethod;
  submitCallback: (body: any, containFiles: boolean) => void;
  getSingleConfig?: IConfigGetSingleMethod;
  rawData?: {};
}

const AuthPageComp = ({ context }: IProps) => {
  //const { location, replace } = useHistory();
  const [user, setUser] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");
  const [tenant, setTenant] = useState<string>("");
  const { setError, httpService } = context;
  const [openedAddTenant, setOpenedAddTenant] = useState<null | IPopupProps>(
    null
  );
  const postConfig: IConfigPostMethod | undefined = {
    url: "/tenants/",
    actualMethod: "post",
    requestHeaders: { "content-type": "application/json" },
    fields: [
      { name: "token", type: "text", value: "", label: "Token" },
      { name: "_id", type: "text", value: "", label: "ID" },
      {
        name: "organization",
        type: "text",
        value: "",
        label: "Organizzazione",
      },
      { name: "address", type: "text", value: "", label: "Indirizzo" },
      { name: "email", type: "email", value: "", label: "e-mail" },
      { name: "phone", type: "text", value: "", label: "Telefono" },
      {
        name: "admin_username",
        type: "text",
        value: "",
        label: "Username Amministratore",
      },
      {
        name: "admin_password",
        type: "password",
        value: "",
        label: "Password Amministratore",
      },
    ],
    queryParams: [],
  };

  async function submitForm(e: any) {
    e.preventDefault();

    try {
      const credentials = {
        username: `${user}`,
        password: `${pwd}`,
        tenant: `${tenant}`,
      };
      const result = await httpService.fetch({
        method: "post",
        origUrl: httpService.loginUrl,
        body: JSON.stringify(credentials),
        headers: { "content-type": "application/json" },
      });
      if (!result) {
        throw new Error(locale().login_error);
      }
      if (result.status === 401) {
        throw new Error(locale().login_error);
      }

      // comment to ENABLE LOGIN FOR DIFFERENT USERS THAN ADMIN
      /* if (result.user.type !== "admin") {
        throw new Error(locale().login_unauthorised_user);
      }
*/
      localStorage.setItem("diten-token", result.token);
      localStorage.setItem(
        "diten-token-expiration-time",
        result.token_expiration_time
      );
      localStorage.setItem("diten-username", result.user.username);
      localStorage.setItem("diten-user-role", result.user.type);
      localStorage.setItem("diten-user-tenant", tenant);
      localStorage.setItem("diten-user-fieldmask", result.user.fieldmask);
      localStorage.setItem("diten-login-time", new Date().getTime().toString());

      /* const userData = await httpService.fetch({
        method: "get",
        origUrl: httpService.baseUrl + "/users/" + result.user._id,
        headers: { "content-type": "application/json" },
      });
      */

      window.location.replace("/");

      //const { from } = location.state || { from: { pathname: "/" } };
      //replace(from);
    } catch (e) {
      setError(e.message);
      toast.error(e.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }

  function handleUserChange(event: any) {
    setUser(event.target.value);
  }

  function handlePwdChange(event: any) {
    setPwd(event.target.value);
  }

  function handleTenantChange(event: any) {
    setTenant(event.target.value);
  }

  function closeAddTenantPopup() {
    setOpenedAddTenant(null);
  }

  async function addTenant(body: any) {
    if (!postConfig) {
      throw new Error("Post method is not defined.");
    }

    const tokenHead = body["token"];

    delete body["token"];

    const result = await httpService.fetch({
      method: "post",
      origUrl: httpService.baseUrl + "/tenants",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json", Authorization: tokenHead },
    });
  }

  return (
    <div className="auth-page">
      <div className="title-wrapper">
        <div className="title-section">Measurify</div>
        <br />
        <div className="subtitle-section">From the edge to cloud and back</div>
      </div>
      <div className="language-wrapper">
        <LanguageSelector />
      </div>
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
          <div className="buttons-wrapper center">
            <Button type="submit" onClick={submitForm} color="green">
              {locale().submit}
            </Button>
          </div>
        </form>

        <br />
        <br />
        <br />
        <br />
        <br />
        <br />

        <div className="form-content">
          <div className="form-row row">
            <h4>{locale().add_tenant}</h4>
            <div className="buttons-wrapper center"></div>
            <Button
              title={locale().add_tenant}
              onClick={() =>
                setOpenedAddTenant({
                  type: "add",
                  title: locale().add_tenant,
                  config: postConfig,
                  submitCallback: addTenant,
                })
              }
              color="green"
            >
              <i className="fa fa-plus-circle" aria-hidden="true"></i>
            </Button>
          </div>
        </div>
      </div>
      {openedAddTenant && (
        <FormPopup
          title={openedAddTenant.title}
          closeCallback={closeAddTenantPopup}
          submitCallback={openedAddTenant.submitCallback}
          fields={openedAddTenant.config?.fields || []}
          rawData={openedAddTenant.rawData}
          getSingleConfig={openedAddTenant.getSingleConfig}
          methodConfig={openedAddTenant.config}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export const AuthPage = withAppContext(AuthPageComp);
