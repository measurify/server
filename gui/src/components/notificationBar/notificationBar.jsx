import {
  Button,
  Badge,
  Offcanvas,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import React, { useEffect, useState, useContext } from "react";
import locale from "../../common/locale";

import AppContext from "../../context";

export default function NotificationBar(props) {
  const [show, setShow] = useState(false);

  const myContext = useContext(AppContext);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
      <Button
        variant="link"
        onClick={() => {
          handleShow();
        }}
        style={{
          color: "#fff",
          textDecoration: "none",
        }}
      >
        {locale().notifications}
        {"  "}
        <Badge pill bg="success">
          {myContext.notifications.length}
        </Badge>
        <span className="visually-hidden">Unread notifications</span>
      </Button>

      <Offcanvas
        style={{
          backgroundColor: "#123651",
          color: "#fff",
        }}
        show={show}
        onHide={handleClose}
        placement="end"
        name={"notification_bar"}
        scroll={false}
        backdrop={true}
        keyboard={true}
      >
        <Offcanvas.Header>
          <Offcanvas.Title>
            {locale().notifications}
            {"  "}
            <Badge pill bg="success">
              {myContext.notifications.length}
            </Badge>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div
            style={{
              width: 100 + "%",
              height: 100 + "%",
            }}
          >
            {myContext.notifications.length !== 0 && (
              <Button
                variant="warning"
                onClick={() => myContext.ClearNotifications()}
              >
                {locale().clear_all}
              </Button>
            )}
            <ToastContainer>
              {myContext.notifications.map((notification, index) => {
                let type;
                if (notification.name === "info") type = "success";
                if (notification.name === "error") type = "danger";
                return (
                  <Toast
                    className="d-inline-block m-1"
                    key={"notification_" + index}
                    bg={type}
                    animation={true}
                    onClose={() => {
                      myContext.RemoveNotification(index);
                    }}
                  >
                    <Toast.Header>
                      <img
                        src="holder.js/20x20?text=%20"
                        className="rounded me-2"
                        alt=""
                      />
                      <strong className="me-auto">{notification.name}</strong>
                      <small>{notification.time.slice(0, 15)}</small>
                    </Toast.Header>
                    <Toast.Body>{notification.msg}</Toast.Body>
                  </Toast>
                );
              })}
            </ToastContainer>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
