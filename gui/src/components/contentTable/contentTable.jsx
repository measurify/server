import React from "react";
import { aliasPages } from "../../config";

import { Table, Button } from "react-bootstrap";
import ActionManager from "../actionsManager/actionsManager";
import { FormatDate } from "../../services/misc_functions";
import fontawesome from "@fortawesome/fontawesome";
import { canDo } from "../../services/userRolesManagement";
import {
  faPlusCircle,
  faDownload,
  faList,
} from "@fortawesome/fontawesome-free-solid";
fontawesome.library.add(faPlusCircle, faDownload, faList);

export default function ContentTable(props) {
  if (props.header === undefined || props.resources === undefined)
    return <div>Loading</div>;
  if (props.header.includes("actions") && props.actions === undefined)
    return <div>Loading</div>;
  return (
    <div>
      <Table responsive striped bordered hover>
        <thead>
          <tr key={"header"}>
            {React.Children.toArray(
              props.header.map((e) => {
                if (aliasPages[props.resType] !== undefined)
                  if (aliasPages[props.resType][e] !== undefined)
                    return (
                      <th>
                        {aliasPages[props.resType][e]}
                        {e !== "Sostanza" && e !== "Livello" && (
                          <React.Fragment>
                            {" "}
                            <Button
                              variant={props.orderBy === e ? "link" : "light"}
                              size="sm"
                              onClick={() => {
                                props.sortHandler(e);
                              }}
                            >
                              <b>
                                {props.ascending === true && props.orderBy === e
                                  ? "^"
                                  : "V"}
                              </b>
                            </Button>
                            <i
                              className={"fa fa-list"}
                              title=""
                              style={{
                                width: 20 + "px",
                                height: 20 + "px",
                                opacity: 0.85,
                              }}
                            ></i>
                          </React.Fragment>
                        )}
                      </th>
                    );

                return (
                  <th>
                    {e}
                    {e !== "Sostanza" && e !== "Livello" && (
                      <React.Fragment>
                        <Button
                          variant={props.orderBy === e ? "link" : "light"}
                          size="sm"
                          onClick={() => {
                            props.sortHandler(e);
                          }}
                        >
                          <b>
                            {props.ascending === true && props.orderBy === e
                              ? "^"
                              : "V"}
                          </b>
                        </Button>
                        <i
                          className={"fa fa-list"}
                          title=""
                          style={{
                            width: 20 + "px",
                            height: 20 + "px",
                            opacity: 0.85,
                          }}
                        ></i>
                      </React.Fragment>
                    )}
                  </th>
                );
              })
            )}
          </tr>
        </thead>
        <tbody>
          {React.Children.toArray(
            props.resources.map((row, index) => {
              return (
                <tr>
                  {React.Children.toArray(
                    props.header.map((e) => {
                      if (e === "actions") {
                        return (
                          <td>
                            {props.actions.includes("view") ? (
                              <ActionManager
                                resType={props.resType}
                                action="view"
                                k={index + "_view"}
                                id={row["_id"]}
                                takeSingle={props.takeSingle}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("edit") &&
                            canDo(props.userRole, props.resType, "update") ? (
                              <ActionManager
                                resType={props.resType}
                                action="edit"
                                k={index + "_edit"}
                                id={row["_id"]}
                                //takeSingle={props.takeSingle}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("duplicate") &&
                            canDo(props.userRole, props.resType, "create") ? (
                              <ActionManager
                                resType={props.resType}
                                action="duplicate"
                                k={index + "_duplicate"}
                                id={row["_id"]}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("delete") &&
                            canDo(props.userRole, props.resType, "delete") ? (
                              <ActionManager
                                resType={props.resType}
                                action="delete"
                                k={index + "_delete"}
                                id={row["_id"]}
                                removeSingle={props.removeSingle}
                              />
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      }
                      if (row[e] === undefined) return;
                      if (Array.isArray(row[e])) {
                        if (
                          row[e][0] !== undefined &&
                          row[e][0].constructor === Object
                        ) {
                          const str =
                            "[ " +
                            row[e]
                              .map((el) => Object.values(el).join(" - "))
                              .join(" -- ") +
                            " ]";
                          return (
                            <td>
                              {str.length <= 100
                                ? str
                                : str.slice(0, 97) + "..."}
                            </td>
                          );
                        }
                        return <td>{"[ " + row[e].join(" , ") + " ]"}</td>;
                      }

                      if (e === "Data")
                        return <td>{FormatDate(new Date(row[e]))}</td>;
                      return <td>{row[e]}</td>;
                    })
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
