import React from "react";
import { aliasPages } from "../../config";

import { Card, ListGroup, CardGroup } from "react-bootstrap";
import ActionManager from "../actionsManager/actionsManager";

export default function ContentCards(props) {
  if (props.header === undefined || props.resources === undefined)
    return <div>Loading</div>;
  if (props.header.includes("actions") && props.actions === undefined)
    return <div>Loading</div>;
  return (
    <CardGroup>
      {React.Children.toArray(
        props.resources.map((res) => {
          const date = new Date(res.samples[0].values[2]);
          return (
            <Card border="primary" style={{ width: "18rem" }}>
              <Card.Header>
                {res.samples[0].values[0]}{" "}
                <ActionManager
                  resType={props.resType}
                  action="delete"
                  id={res._id}
                  removeSingle={props.removeSingle}
                />
              </Card.Header>
              <Card.Body>
                <Card.Text>{date.toDateString()}</Card.Text>
                <Card.Text>{res.samples[0].values[1]}</Card.Text>
              </Card.Body>
              <ListGroup className="list-group-flush">
                {React.Children.toArray(
                  res.samples.map((person) => {
                    return (
                      <ListGroup.Item>
                        {person.values[5] +
                          " " +
                          person.values[4] +
                          " : " +
                          person.values[7] +
                          " " +
                          person.values[8] +
                          " " +
                          person.values[9]}
                      </ListGroup.Item>
                    );
                  })
                )}
              </ListGroup>
            </Card>
          );
        })
      )}
    </CardGroup>
  );
}
