import React, { useEffect, useState } from "react";
import locale from "../../common/locale";
import { viewFields } from "../../config";
import { NavLink } from "react-router-dom";

import fontawesome from "@fortawesome/fontawesome";
import {
  faEye,
  faPencilAlt,
  faCopy,
} from "@fortawesome/fontawesome-free-solid";
import {
  Button,
  OverlayTrigger,
  Popover,
  Accordion,
  Table,
} from "react-bootstrap";

import { delete_generic } from "../../services/http_operations";

fontawesome.library.add(faEye, faPencilAlt, faCopy);

function ActionContent(props) {
  const toShow = {};
  viewFields[props.resType].map((k) => {
    if (k instanceof Object) {
      Object.keys(k).map((subK) => {
        if (Array.isArray(props.resource[subK])) {
          toShow[subK] = props.resource[subK].map((e) => {
            const row = {};
            k[subK].map((f) => {
              row[f] = e[f];
            });
            return row;
          });
        } else {
          toShow[subK] = props.resource[subK];
        }
      });
    } else {
      if (Object.keys(props.resource).includes(k)) {
        toShow[k] = props.resource[k];
      }
    }
  });

  //render accordion with table when field is array of object
  return (
    <Accordion
      defaultActiveKey="0"
      style={{ width: 15 + "vw", minWidth: 380 + "px" }}
    >
      {React.Children.toArray(
        Object.keys(toShow).map((key, index) => {
          return (
            <Accordion.Item eventKey={index}>
              <Accordion.Header>
                <b>{key}</b>
              </Accordion.Header>
              <Accordion.Body>
                {toShow[key] !== null ? (
                  Array.isArray(toShow[key]) ? (
                    toShow[key][0] instanceof Object ? (
                      <Table responsive striped bordered hover size="sm">
                        <thead>
                          <tr>
                            {React.Children.toArray(
                              Object.keys(toShow[key][0]).map((e) => {
                                return <th>{e}</th>;
                              })
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {React.Children.toArray(
                            toShow[key].map((row, index) => {
                              return (
                                <tr>
                                  {React.Children.toArray(
                                    Object.values(row).map((v) => {
                                      return <td>{v}</td>;
                                    })
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </Table>
                    ) : (
                      "[ " + toShow[key].join(" - ") + " ]"
                    )
                  ) : (
                    toShow[key]
                  )
                ) : (
                  "None"
                )}
              </Accordion.Body>
            </Accordion.Item>
          );
        })
      )}
    </Accordion>
  );
}

export default function ActionManager(props) {
  const [res, setRes] = useState(undefined);
  useEffect(() => {
    //use effect body
  }, [props]);

  const viewPopover =
    res !== undefined ? (
      <Popover
        id="popover-positioned-left"
        style={{ width: 20 + "vw", minWidth: 400 + "px" }}
      >
        <Popover.Header as="h3">View Resource</Popover.Header>
        <Popover.Body>
          <ActionContent resource={res} resType={props.resType} />
        </Popover.Body>
      </Popover>
    ) : (
      <Popover id="popover-positioned-left" style={{ width: 20 + "vw" }}>
        <Popover.Header as="h3">
          Loading<Popover.Body></Popover.Body>
        </Popover.Header>
      </Popover>
    );
  if (props.action === "view") {
    return (
      <OverlayTrigger
        trigger="click"
        placement="left"
        overlay={viewPopover}
        rootClose={true}
      >
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            setRes(props.takeSingle(props.id));
          }}
        >
          <i
            className="fa fa-eye"
            aria-hidden="true"
            title="View"
            style={{
              width: 30 + "px",
              height: 30 + "px",
              marginRight: 10 + "px",
              opacity: 0.85,
            }}
          ></i>
        </Button>
      </OverlayTrigger>
    );
  }
  if (props.action === "delete") {
    return (
      <Button
        variant="link"
        size="sm"
        onClick={async () => {
          const result = window.confirm("Want to delete: " + props.id + "?");
          if (result) {
            try {
              const response = await delete_generic(props.resType, props.id);

              if (response.response.status == 200) {
                props.removeSingle(props.id);
              }
            } catch (error) {
              console.log(error);
            }
          }
        }}
      >
        <i
          className="fa fa-times"
          aria-hidden="true"
          title="Delete"
          style={{
            width: 30 + "px",
            height: 30 + "px",
            marginRight: 10 + "px",
            opacity: 0.85,
          }}
        ></i>
      </Button>
    );
  }
  if (props.action === "edit") {
    return (
      <NavLink to={`/edit/` + props.resType + "/" + props.id}>
        <Button variant="link" size="sm">
          <i
            className="fa fa-pencil-alt"
            aria-hidden="true"
            title="Edit"
            style={{
              width: 30 + "px",
              height: 30 + "px",
              marginRight: 10 + "px",
              opacity: 0.85,
            }}
          ></i>
        </Button>
      </NavLink>
    );
  }
  if (props.action === "duplicate") {
    return (
      <NavLink to={`/add/` + props.resType + "/" + "?from=" + props.id}>
        <Button variant="link" size="sm">
          <i
            className="fa fa-copy"
            aria-hidden="true"
            title="Duplicate"
            style={{
              width: 30 + "px",
              height: 30 + "px",
              marginRight: 10 + "px",
              opacity: 0.85,
            }}
          ></i>
        </Button>
      </NavLink>
    );
  }

  return <div />;
}
