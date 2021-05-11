import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
  NavLink,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ConfigService from "../services/config.service";
import { IConfig, IConfigPage } from "../common/models/config.model";
import { Page } from "../components/page/page.comp";
import { AuthPage } from "../components/authPage/authPage.comp";
import { HomePage } from "../components/homePage/homePage";
import { NotFoundPage } from "../components/notFoundPage/notFoundPage";
import { Navigation } from "../components/navigation/navigation.comp";
import { RightBar } from "../components/rightbar/rightbar";
import { AppContext } from "./app.context";
import HttpService from "../services/http.service";
import { CustomStyles } from "./customStyles/customStyles.comp";

import "./app.scss";
import "react-toastify/dist/ReactToastify.css";
import { remoteConfig } from "firebase-admin";
import locale from "../common/locale";
import { UnauthorizedPage } from "./unauthorizedPage/unauthorizedPage";

interface ILoadedFields {
  fieldName: string;
  values: Array<string>;
}

const httpService = new HttpService();
const defaultAppName: string = "Measurify GUI";

function changeFavicon(src: string) {
  const link = document.createElement("link");
  const oldLink = document.getElementById("favicon");
  link.id = "favicon";
  link.rel = "shortcut icon";
  link.href = src;
  if (oldLink) {
    document.head.removeChild(oldLink);
  }
  document.head.appendChild(link);
}

function App() {
  const [loadedFields, setLoadedFields] = useState<ILoadedFields[]>(
    Array<ILoadedFields>(0)
  );
  const [fetchedData, setFetchedData] = useState<boolean>();
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [config, setConfig] = useState<IConfig | null>(null);
  const [activePage, setActivePage] = useState<IConfigPage | null>(
    config?.pages?.[0] || null
  );
  const [error, setError] = useState<string | null>(null);
  const appName: string = config?.name || defaultAppName;

  async function loadConfig(url?: string): Promise<void> {
    try {
      const windowConfig = (window as any).RESTool?.config;

      let remoteConfig: IConfig;

      // Try to load config from window object first
      if (!url && windowConfig) {
        remoteConfig = Object.assign({}, windowConfig, {});
      } else {
        remoteConfig = url
          ? await ConfigService.getRemoteConfig(url)
          : await ConfigService.loadDefaultConfig();
      }

      // Setting global config for httpService

      httpService.baseUrl = remoteConfig.baseUrl || "";
      httpService.loginUrl = remoteConfig.loginUrl || "";
      httpService.errorMessageDataPath =
        remoteConfig.errorMessageDataPath || "";
      httpService.unauthorizedRedirectUrl =
        remoteConfig.unauthorizedRedirectUrl || "";
      httpService.requestHeaders = remoteConfig.requestHeaders || {};
      document.title = remoteConfig.name || defaultAppName;

      if (remoteConfig?.favicon) {
        changeFavicon(remoteConfig.favicon);
      }

      if (remoteConfig?.remoteUrl) {
        return await loadConfig(remoteConfig.remoteUrl);
      }

      setConfig(remoteConfig);
    } catch (e) {
      console.error("Could not load config file", e);
    }

    setFirstLoad(false);
  }

  async function preloadData() {
    const resultsData = await httpService.fetch({
      method: "get",
      origUrl: httpService.baseUrl + "v1/types",
      headers: { "content-type": "application/json" },
    });

    var tempLD = Array<ILoadedFields>(12).fill({
      fieldName: "",
      values: [],
    });
    const keys = Object.keys(resultsData);
    const values: Array<string> = Object.values(resultsData);

    for (var i in tempLD) {
      tempLD[i] = { fieldName: keys[i], values: Object.values(values[i]) };
    }

    setLoadedFields(tempLD);
  }

  function scrollToTop(scrollDuration: number = 250) {
    var cosParameter = window.scrollY / 2,
      scrollCount = 0,
      oldTimestamp = performance.now();

    function step(newTimestamp: number) {
      scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp));

      if (scrollCount >= Math.PI) {
        window.scrollTo(0, 0);
      }

      if (window.scrollY === 0) {
        return;
      }

      window.scrollTo(
        0,
        Math.round(cosParameter + cosParameter * Math.cos(scrollCount))
      );
      oldTimestamp = newTimestamp;
      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  useEffect(() => {
    loadConfig();
    setFetchedData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { isValid, errorMessage } = ConfigService.validateConfig(config);

    if (!isValid) {
      setError(errorMessage);
      toast.error(errorMessage, {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
  }, [config]);

  const tkn = localStorage.getItem("diten-token");

  if (tkn === null)
    return (
      <div className="restool-app">
        <AppContext.Provider
          value={{
            config,
            activePage,
            setActivePage,
            error,
            setError,
            httpService,
          }}
        >
          <Router>
            <Route path="/" component={AuthPage} />
          </Router>
        </AppContext.Provider>
      </div>
    );

  if (tkn !== null && fetchedData === false) {
    preloadData();

    setFetchedData(true);
  }

  return (
    <div className="restool-app">
      {!config ? (
        <div className="app-error">
          {firstLoad
            ? "Loading Configuration..."
            : "Could not find config file."}
        </div>
      ) : (
        <AppContext.Provider
          value={{
            config,
            activePage,
            setActivePage,
            error,
            setError,
            httpService,
          }}
        >
          {config.customStyles && <CustomStyles styles={config.customStyles} />}
          <Router>
            <aside>
              <NavLink to="/home" className="nav-wrap">
                {appName}
              </NavLink>
              {<Navigation />}
            </aside>
            {config && (
              <Switch>
                <Route exact path="/home" component={() => <HomePage />} />
                <Route
                  exact
                  path="/unauthorized"
                  component={UnauthorizedPage}
                />
                <Route exact path="/404" component={NotFoundPage} />
                <Route
                  exact
                  path="/:page"
                  component={() => <Page loadedFields={loadedFields} />}
                />

                <Redirect path="/" to="/home" />
                <Route path="*" component={NotFoundPage} />
              </Switch>
            )}
            <div className="right-bar">
              <RightBar />
            </div>
            <ToastContainer
              position={toast.POSITION.TOP_CENTER}
              autoClose={4000}
              draggable={false}
            />
          </Router>
        </AppContext.Provider>
      )}
    </div>
  );
}

export default App;
