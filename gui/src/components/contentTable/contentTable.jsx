import React from "react";
import { aliasPages } from "../../config";

import { Table } from "react-bootstrap";
import ActionManager from "../actionsManager/actionsManager";

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
                            {props.actions.includes("edit") ? (
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
                            {props.actions.includes("duplicate") ? (
                              <ActionManager
                                resType={props.resType}
                                action="duplicate"
                                k={index + "_duplicate"}
                                id={row["_id"]}
                              />
                            ) : (
                              ""
                            )}
                            {props.actions.includes("delete") ? (
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
