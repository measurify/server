import React from "react";
import { aliasPages } from "../../configManager";

import { Table } from "react-bootstrap";
import ActionManager from "../actionsManager/actionsManager";
import { canDo } from "../../services/userRolesManagement";

export default function ContentTable(props) {
  if (props.header === undefined || props.resources === undefined)
    return <div>Loading</div>;
  if (props.header.includes("_actions") && props._actions === undefined)
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
                    return <th>{aliasPages[props.resType][e]}</th>;
                return <th>{e}</th>;
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
                      if (e === "_actions") {
                        return (
                          <td>
                            {props._actions.includes("view") ? (
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
                            {props._actions.includes("edit") &&
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
                            {props._actions.includes("duplicate") &&
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
                            {props._actions.includes("delete") &&
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
                      if (row[e] === undefined) return <td>--undefined--</td>;
                      if (Array.isArray(row[e]))
                        return <td>{"[ " + row[e].join(" , ") + " ]"}</td>;
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
