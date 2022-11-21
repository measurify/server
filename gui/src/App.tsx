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
import Navigation from "./components/navigation/navigation.comp";
import Page from "./components/page/page";
import ProfilePage from "./components/profilePage/profilePage";
import "./App.scss";
import UnauthorizedPage from "./components/unauthorizedPage/unauthorizedPage";

import { Container, Row, Col } from "react-bootstrap";

import NotificationBar from "./components/notificationBar/notificationBar";
import HorizontalNavigationBar from "./components/horizontalNavigationBar/horizontalNavigationBar";
import AppContext from "./context";

import {
  notificationManager,
  get_generic,
  getBigDataCloudLocation,
} from "./services/http_operations";
import EditContentPage from "./components/editContentPage/editContentPage";
import AddPage from "./components/addPage/addPage";
import AddExperimentPage from "./components/addExperimentPage/addExperimentPage";
import { layout } from "./config";
import AddMeasurementsPage from "./components/addMeasurementsPage/addMeasurementsPage";
import cloneDeep from "clone-deep";
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
  const [types, setTypes] = useState<Object | undefined>();
  const [data, setData] = useState<Object>({});

  let layoutRef = React.useRef<string | null>();
  const tkn = localStorage.getItem("token");
  const location = localStorage.getItem("city");

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

  ////////////////////////////GET COORDINATES FROM BROWSER

  useEffect(() => {
    const getLocation = async () => {
      if (navigator.geolocation) {
        let latitude;
        let longitude;
        navigator.geolocation.getCurrentPosition((position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        });
        try {
          await getBigDataCloudLocation(latitude, longitude);
        } catch (error) {
          console.log("Error while connecting to Geolocalization APIs");
        }
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    };

    //if location has been already set, return
    if (location !== null) {
      return;
    }
    // call the function
    try {
      getLocation();
    } catch (error) {
      console.log(error);
    }
  }, []);

  ///////////////////////////////////////

  ///////////////FETCHED TYPES AND DATA MANAGEMENT FRAGMENT
  //function to push a new notification at the beginning of the list
  function UpdateData(fetched: string[], key: string) {
    setData((prev) => {
      return { ...prev, [key]: [...fetched] };
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
      } catch (error) {
        console.log(error);
      }
    };

    //if types has been already set, ignore it
    if (types !== undefined) return;
    // call the function
    try {
      fetchTypes();
    } catch (error) {
      console.log(error);
    }
    // make sure to catch any error
  }, []);

  const fetchedManagement = {
    types: types,
    data: data,
    UpdateData: UpdateData,
  };
  ///////////////END FETCHED TYPES MANAGEMENT FRAGMENT

  //not logged => show auth page
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
    <AppContext.Provider
      value={{
        notifications: notificationManagement,
        fetched: fetchedManagement,
      }}
    >
      <Router>
        <Container
          fluid
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            height: 100 + "vh",
          }}
        >
          <Row
            style={{
              padding: 0,
            }}
          >
            <Col md="auto" style={{ padding: 0, minWidth: 250 + "px" }}>
              <Navigation />
            </Col>

            <Col style={{ paddingLeft: 0, paddingRight: 0 }}>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate replace to="/add/measurements" />}
                />

                <Route path="/home" element={<HomePage />} />
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
                <Route path="/add/:resource/" element={<AddPage />} />
                <Route path="/:page" element={<Page res=":page" />} />

                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/404" element={<NotFoundPage />} />

                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Col>
          </Row>
        </Container>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
