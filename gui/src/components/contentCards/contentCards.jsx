import React from "react";
import { aliasPages } from "../../config";

import { Card, ListGroup, CardGroup } from "react-bootstrap";
import ActionManager from "../actionsManager/actionsManager";

export default function ContentCards(props) {
  if (props.header === undefined || props.resources === undefined)
    return <div>Loading</div>;
  if (props.header.includes("actions") && props.actions === undefined)
    return <div>Loading</div>;

  if (props.resources.length === 0) return "Non sono presenti controlli";
  return (
    <CardGroup>
      {React.Children.toArray(
        props.resources.map((res) => {
          const date = new Date(res.samples[0].values[2]);

          const numPerson = new Set(
            res.samples.map((person) => person.values[4])
          ).size;
          const report = res.samples
            .filter((person) => person.values[10] !== "nullo")
            .map((person) => {
              return (
                <ListGroup.Item>
                  {person.values[6] +
                    "_" +
                    person.values[4] +
                    " (" +
                    person.values[5] +
                    ") : " +
                    person.values[9] +
                    " " +
                    person.values[10]}
                </ListGroup.Item>
              );
            });

          if (report.length !== numPerson) {
            const negPerson = res.samples
              .filter((person) => person.values[8] === "negativo")
              .map((e) => [
                e.values[6],
                e.values[4],
                e.values[5],
                e.values[8],
              ])[0];
            report.push(
              <ListGroup.Item>
                {negPerson[0] +
                  "_" +
                  negPerson[1] +
                  " (" +
                  negPerson[2] +
                  ") : " +
                  negPerson[3]}
              </ListGroup.Item>
            );
          }
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
                {React.Children.toArray(report)}
              </ListGroup>
            </Card>
          );
        })
      )}
    </CardGroup>
  );
}
