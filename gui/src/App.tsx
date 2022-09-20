import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Route,
  NavLink,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthPage } from "./components/authPage/authPage.comp";
import { HomePage } from "./components/homePage/homePage";
import { NotFoundPage } from "./components/notFoundPage/notFoundPage";
import { Navigation } from "./components/navigation/navigation.comp";
import Page from "./components/page/page";

import "./App.scss";
import UnauthorizedPage from "./components/unauthorizedPage/unauthorizedPage";

import NotificationBar from "./components/notificationBar/notificationBar";
import { website_name } from "./config";

import AppContext from "./context";

import { notificationManager, get_generic } from "./services/http_operations";
import EditContentPage from "./components/editContentPage/editContentPage";
import AddPage from "./components/addPage/addPage";
import AddExperimentPage from "./components/addExperimentPage/addExperimentPage";
import { SetFetchedData, fetchedData } from "./fetchedData";

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
  const appName: string = website_name;

  const tkn = localStorage.getItem("diten-token");

  //use effect to fetch static data from the server (like types)
  useEffect(() => {
    // declare the async data fetching function
    const fetchTypes = async () => {
      // get the data from the api
      try {
        const response = await get_generic("types", {}, "");

        SetFetchedData(response.response.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (fetchedData !== undefined) return;
    // call the function
    try {
      fetchTypes();
    } catch (error) {
      console.log(error);
    }
    // make sure to catch any error
  }, []);

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

  const notificationsSettings = {
    notifications: notifications,
    PushNotification,
    RemoveNotification,
    ClearNotifications,
  };

  notificationManager.ClearNotifications = ClearNotifications;
  notificationManager.PushNotification = PushNotification;
  notificationManager.RemoveNotification = RemoveNotification;

  if (tkn === null)
    return (
      <div className="app">
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route
              path="/add/tenants"
              element={<AddPage resource={"tenants"} />}
            />
          </Routes>
        </Router>
      </div>
    );

  return (
    <AppContext.Provider value={notificationsSettings}>
      <div className="app">
        <Router>
          <aside>
            <NavLink to="/home" className="nav-wrap">
              {appName}
            </NavLink>
            <Navigation />
          </aside>

          <div className="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/add/experiments/" element={<AddExperimentPage />} />

              <Route path="/edit/:resource/:id" element={<EditContentPage />} />
              <Route path="/add/:resource/" element={<AddPage />} />
              <Route path="/:page" element={<Page res=":page" />} />

              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/404" element={<NotFoundPage />} />

              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
          <div className="right-bar">
            <NotificationBar />
          </div>
        </Router>
      </div>
    </AppContext.Provider>
  );
}

export default App;
