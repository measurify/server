import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthPage } from "./components/authPage/authPage.comp";
import { HomePage } from "./components/homePage/homePage";
import { NotFoundPage } from "./components/notFoundPage/notFoundPage";
import Navigation from "./components/navigation/navigation.comp";
import Page from "./components/page/page";
import ProfilePage from "./components/profilePage/profilePage";
import "./App.scss";
import UnauthorizedPage from "./components/unauthorizedPage/unauthorizedPage";

import { Container, Row, Col } from "react-bootstrap";

import NotificationBar from "./components/notificationBar/notificationBar";
import HorizontalNavigationBar from "./components/horizontalNavigationBar/horizontalNavigationBar";
import AppContext from "./context";
import { FilterTenantNames } from "./configManager";
import {
  notificationManager,
  get_generic,
  SetAPIUrl,
} from "./services/http_operations";
import { logsManager } from "./services/operation_tool_services";
import EditContentPage from "./components/editContentPage/editContentPage";
import AddPage from "./components/addPage/addPage";
import AddExperimentPage from "./components/addExperimentPage/addExperimentPage";
import { layout } from "./configManager";
import AddMeasurementsPage from "./components/addMeasurementsPage/addMeasurementsPage";
import UpdateHistoryPage from "./components/OperationalPages/updateHistorySteps/updateHistory";
import DownloadPage from "./components/OperationalPages/downloadhistory/downloadExperiment";
import RemoveStepsPage from "./components/OperationalPages/removeHistorySteps/removeSteps";
import PasswordRecoveryPage from "./components/passwordRecoveryPage/PasswordRecoveryPage";
import PasswordResetPage from "./components/PasswordResetPage/PasswordResetPage";
import UploadMeasurementsPage from "./components/OperationalPages/uploadMeasurements/uploadMeasurements";
import DownloadMeasurementsPage from "./components/OperationalPages/downloadMeasurements/downloadMeasurements";
import DownloadTimeseriesPage from "./components/OperationalPages/downloadTimeseries/DownloadTimeseriesPage";
import VisualizeTimeseriesPage from "./components/OperationalPages/visualizeTimeseries/VisualizeTimeseriesPage";
import { AutorefreshToken } from "./services/token_time_operations";

import {
  ResetConfig,
  LoadConfig,
  show_notification_bar,
} from "./configManager";
import LoadIcons from "./services/icons";
import { AccessiblePages } from "./services/userRolesManagement";
/*
    notifications follow this schema

    {
        name: "notification name"
        time: ""
        message: "this is a message"
    }


*/

interface INotification {
  type: string;
  time: string;
  msg: string;
}

function App() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [logs, setLogs] = useState<INotification[]>([]);
  const [types, setTypes] = useState<Object | undefined>();
  const [tenants, setTenants] = useState<String[]>([]);
  const [data, setData] = useState<Object>({});

  let layoutRef = React.useRef<string | null>();
  let intervalRef = React.useRef<any>(null);
  const tkn = localStorage.getItem("token");

  //load icons
  LoadIcons();

  //reset the config to define basics variables
  ResetConfig();

  //load configuration according to domain logic
  LoadConfig();

  //set api url to run https operations
  SetAPIUrl();

  ////////////////NOTIFICATION MANAGEMENT FRAGMENT
  //function to push a new notification at the beginning of the list
  function PushNotification(obj: INotification) {
    setNotifications((prev) => [obj].concat(prev));
    //notifications.push(obj);
  }

  //function to remove a single notification from list
  function RemoveNotification(id: number) {
    let tmp = [...notifications];
    tmp.splice(id, 1);
    setNotifications(tmp);
  }

  //function to clear notifications list
  function ClearNotifications() {
    setNotifications([]);
  }

  const notificationManagement = {
    notifications: notifications,
    PushNotification,
    RemoveNotification,
    ClearNotifications,
  };

  notificationManager.ClearNotifications = ClearNotifications;
  notificationManager.PushNotification = PushNotification;
  notificationManager.RemoveNotification = RemoveNotification;

  ///////////////END NOTIFICATION MANAGEMENT FRAGMENT

  ///////////////FETCHED TYPES AND DATA MANAGEMENT FRAGMENT
  //function to push a new fetched data block
  function UpdateData(fetched: string[], key: string) {
    setData((prev) => {
      return { ...prev, [key]: [...fetched] };
    });
  }

  //function to remove a fetched data block
  function RemoveData(key: string) {
    setData((prev) => {
      return { ...prev, [key]: undefined };
    });
  }

  //use effect to fetch static data from the server /types
  useEffect(() => {
    // declare the async data fetching function
    const fetchTypes = async () => {
      // get the data from the api
      try {
        const response = await get_generic("types", {}, "");

        setTypes(response.response.data);
      } catch (error) {}
    };

    const fetchTenants = async () => {
      try {
        const response = await get_generic("types/tenants", {}, "");
        const _tenants = response.docs.map((e: any) => e._id);
        let filtered = FilterTenantNames(_tenants);
        const tkn = localStorage.getItem("user-tenant");
        if (tkn !== undefined && filtered.includes(tkn)) {
          filtered = filtered.filter((item: String) => item !== tkn);
          filtered.unshift(tkn);
        }

        setTenants(filtered);
      } catch (error) {
        console.error(error);
      }
    };

    //if types has been already set, ignore it
    if (types !== undefined) return;
    // call the function
    try {
      fetchTypes();
      fetchTenants();
    } catch (error) {
      console.error(error);
    }
    // make sure to catch any error
  }, []);

  const fetchedManagement = {
    types: types,
    data: data,
    UpdateData: UpdateData,
    RemoveData: RemoveData,
  };
  ///////////////END FETCHED TYPES MANAGEMENT FRAGMENT

  ///////////////////////////LOGGER MANAGEMENT FRAGMENT
  //function to push a new notification at the beginning of the list
  function PushLog(obj: INotification) {
    setLogs((prev) => [obj].concat(prev));
    let textarea = document.getElementById("logger");
    if (textarea !== null && textarea !== undefined)
      textarea.scrollTop = textarea.scrollHeight;
  }
  //function to remove a single notification from list
  function RemoveLog(id: number) {
    let tmp = [...logs];
    tmp.splice(id, 1);
    setLogs(tmp);
  }

  //function to clear notifications list
  function ClearLogs() {
    setLogs([]);
  }

  const logsManagement = {
    logs: logs,
    PushLog,
    RemoveLog,
    ClearLogs,
  };

  logsManager.ClearLogs = ClearLogs;
  logsManager.PushLog = PushLog;
  logsManager.RemoveLog = RemoveLog;
  ///////////////////////////END LOGGER MANAGEMENT FRAGMENT

  //mobile view only allowed to be vertical
  if (/Mobi/i.test(window.navigator.userAgent) === true) {
    layoutRef.current = "vertical";
  } else {
    layoutRef.current = layout;
  }

  //not logged => show auth page
  //grant tenant route when not logged
  if (tkn === null)
    return (
      <div className="app">
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage tenants={tenants} />} />
            <Route
              path="/passwordrecovery"
              element={<PasswordRecoveryPage tenants={tenants} />}
            />
            <Route
              path="/passwordreset"
              element={<PasswordResetPage tenants={tenants} />}
            />
            <Route
              path="/add/tenants"
              element={<AddPage resource={"tenants"} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    );
  if (tkn !== null && intervalRef.current === null) {
    intervalRef.current = AutorefreshToken();
  }

  //get accessible pages
  const {
    count,
    numAccessibleResources,
    accessibleOperations,
    accessibleList,
  } = AccessiblePages();

  //if logged => show home page
  return (
    <AppContext.Provider
      value={{
        notifications: notificationManagement,
        fetched: fetchedManagement,
        logs: logsManagement,
      }}
    >
      <Router>
        <Container
          fluid
          style={{
            padding: 0,
            margin: 0 + "px",
            height: 100 + "vh",
            //width: 99 + "vw",
          }}
        >
          {layoutRef.current === "horizontal" ? (
            <Row style={{ padding: 0 }}>
              <HorizontalNavigationBar />
            </Row>
          ) : (
            ""
          )}
          <Row
            style={{
              padding: 0 + "px",
              height: 100 + "%",
              margin: 0 + "px",
            }}
          >
            {layoutRef.current === "vertical" ? (
              <Col md="auto" style={{ padding: 0, minWidth: 250 + "px" }}>
                <Navigation />
              </Col>
            ) : (
              ""
            )}
            {/Mobi/i.test(window.navigator.userAgent) === true && (
              <Col md="auto" style={{ padding: 0 }}>
                <NotificationBar />
              </Col>
            )}
            <Col style={{ paddingLeft: 0, paddingRight: 0 }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    count === 1 ? (
                      <Navigate to={"/" + accessibleList[0]} replace />
                    ) : (
                      <HomePage />
                    )
                  }
                />
                <Route
                  path="/home"
                  element={
                    count === 1 ? (
                      <Navigate to={"/" + accessibleList[0]} replace />
                    ) : (
                      <HomePage />
                    )
                  }
                />
                <Route path="/viewProfile" element={<ProfilePage />} />
                <Route
                  path="/add/experiments/"
                  element={<AddExperimentPage />}
                />
                <Route
                  path="/add/measurements/"
                  element={<AddMeasurementsPage />}
                />

                <Route
                  path="/edit/:resource/:id"
                  element={<EditContentPage />}
                />
                <Route
                  path="/downloadexperiment"
                  element={
                    accessibleOperations.includes("downloadexperiment") ? (
                      <DownloadPage />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />
                <Route
                  path="/updatehistory"
                  element={
                    accessibleOperations.includes("updatehistory") ? (
                      <UpdateHistoryPage />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />
                <Route
                  path="/removesteps"
                  element={
                    accessibleOperations.includes("removesteps") ? (
                      <RemoveStepsPage />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />
                <Route
                  path="/uploadmeasurements"
                  element={
                    accessibleOperations.includes("uploadmeasurements") ? (
                      <UploadMeasurementsPage />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />
                <Route
                  path="/downloadmeasurements"
                  element={
                    accessibleOperations.includes("downloadmeasurements") ? (
                      <DownloadMeasurementsPage />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />
                <Route
                  path="/downloadtimeseries"
                  element={
                    accessibleOperations.includes("downloadtimeseries") ? (
                      <DownloadTimeseriesPage />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />
                <Route
                  path="/visualizetimeseries"
                  element={
                    accessibleOperations.includes("visualizetimeseries") ? (
                      <VisualizeTimeseriesPage />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />

                <Route path="/add/:resource/" element={<AddPage />} />
                <Route
                  path="/:page"
                  element={
                    numAccessibleResources !== 0 ? (
                      <Page res=":page" />
                    ) : (
                      <Navigate to="/404" replace />
                    )
                  }
                />

                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/404" element={<NotFoundPage />} />

                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Col>
            {show_notification_bar === true &&
              layoutRef.current === "vertical" &&
              /Mobi/i.test(window.navigator.userAgent) === false && (
                <Col md="auto" style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <NotificationBar />
                </Col>
              )}
          </Row>
        </Container>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
