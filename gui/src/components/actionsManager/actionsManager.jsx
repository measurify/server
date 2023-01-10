import React, { useEffect, useState } from "react";
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
import { FormatDate } from "../../services/misc_functions";

fontawesome.library.add(faEye, faPencilAlt, faCopy);

function ActionContent(props) {
  const toShow = {};
  //this should be optimised
  viewFields[props.resType].forEach((k) => {
    if (k.constructor === Object) {
      Object.keys(k).forEach((subK) => {
        if (Array.isArray(props.resource[subK])) {
          toShow[subK] = props.resource[subK].map((e) => {
            const row = {};
            k[subK].forEach((f) => {
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
  //end of optimitazion block
  //render accordion with table when field is array of object
  return UnrollView(toShow);
}

function UnrollView(item) {
  return (
    <Accordion defaultActiveKey={0} size={"lg"}>
      {React.Children.toArray(
        Object.entries(item).map(([key, value], i) => {
          return (
            <Accordion.Item eventKey={i}>
              <Accordion.Header>
                <b>{key}</b>
              </Accordion.Header>
              <Accordion.Body>
                {value instanceof Object ? (
                  Array.isArray(value) ? (
                    value[0] !== undefined ? (
                      Object.values(value[0]).some(
                        (e) => e instanceof Object
                      ) ? (
                        React.Children.toArray(
                          value.map((single, i) => {
                            let title = (
                              <span>
                                {key} <i>[{i}]</i>
                              </span>
                            );
                            //specific titles depending on key
                            if (key === "history" && single.step !== undefined)
                              title = (
                                <span>
                                  Step <i>{single.step}</i>
                                </span>
                              );
                            if (key === "metadata" && single.name !== undefined)
                              title = (
                                <span>
                                  <i>{single.name}</i>
                                </span>
                              );
                            if (key === "topics" && single.name !== undefined)
                              title = (
                                <span>
                                  <i>{single.name}</i>
                                </span>
                              );
                            return (
                              <Accordion>
                                <Accordion.Item eventKey="0">
                                  <Accordion.Header>{title}</Accordion.Header>
                                  <Accordion.Body>
                                    {UnrollView(single)}
                                  </Accordion.Body>
                                </Accordion.Item>
                              </Accordion>
                            );
                          })
                        )
                      ) : value[0] instanceof Object ? (
                        <Table responsive striped bordered hover size="sm">
                          <thead>
                            <tr>
                              {React.Children.toArray(
                                Object.keys(value[0]).map((e) => {
                                  return <th>{e}</th>;
                                })
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {React.Children.toArray(
                              value.map((row) => {
                                return (
                                  <tr>
                                    {React.Children.toArray(
                                      Object.values(row).map((v) => {
                                        if (Array.isArray(v))
                                          return <td>[{v.join(", ")}]</td>;
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
                        "[ " + value.join(" , ") + " ]"
                      )
                    ) : (
                      "[ ]"
                    )
                  ) : (
                    <Table responsive striped bordered hover size="sm">
                      <tbody>
                        {React.Children.toArray(
                          Object.entries(value).map((entr) => {
                            return (
                              <tr>
                                <td>
                                  <b>{entr[0]}</b>
                                </td>
                                <td>
                                  {typeof entr[1] !== "string"
                                    ? entr[1].toString()
                                    : entr[1]}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  )
                ) : value === undefined || value == null ? (
                  <i>None</i>
                ) : key.toLowerCase().includes("date") ? (
                  FormatDate(value)
                ) : (
                  value
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
        style={{
          width: 20 + "vw",
          minWidth:
            /Mobi/i.test(window.navigator.userAgent) == true ? 250 : 400 + "px",
        }}
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

              if (response.response.status === 200) {
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
      <NavLink to={`/add/` + props.resType + "/?from=" + props.id}>
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
