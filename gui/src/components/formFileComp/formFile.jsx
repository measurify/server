import React from "react";
import locale from "../../common/locale";
import { Button, Form, Accordion, Table } from "react-bootstrap";
import Papa from "papaparse";

export const FormFile = (props) => {
  if (
    props.submitFunction === undefined ||
    props.backFunction === undefined ||
    props.setContentPlain === undefined ||
    props.setCsvContent === undefined ||
    props.csvContent === undefined ||
    props.contentPlain === undefined ||
    props.setMsg === undefined ||
    props.setIsError === undefined
  )
    return "Loading";

  const fileSubmitHandle = (e) => {
    if (
      e.target.files === null ||
      e.target.files === undefined ||
      e.target.files === "" ||
      e.target.files[0] === undefined
    ) {
      props.setFile(null);
      props.setCsvContent(null);
      return;
    }
    const _file = e.target.files[0];
    props.setFile(_file);
    const fileReader = new FileReader();

    fileReader.onloadend = () => {
      const content = fileReader.result;

      if (_file.name.endsWith(".csv")) {
        const _file = e.target.files[0];
        Papa.parse(_file, {
          preview: 11,
          complete: function (results) {
            props.setCsvContent(results.data);
            props.setContentPlain(null);
          },
        });
      }
      if (_file.name.endsWith(".json")) {
        try {
          const contentPlain = JSON.stringify(JSON.parse(content), null, 4);
          props.setCsvContent(null);
          props.setContentPlain(contentPlain);
          props.setMsg("");
          props.setIsError(false);
        } catch (error) {
          props.setMsg(
            "The selected file cannot be parsed as JSON because it contains errors. Please select another file or fix it before uploading"
          );
          props.setIsError(true);
        }
      }
    };
    fileReader.readAsText(_file);
  };

  return (
    <Form onSubmit={props.submitFunction}>
      <Form.Label>
        <b>{locale().select_file}</b>
      </Form.Label>
      <Form.Control
        className="mb-3"
        type="file"
        accept=".csv, .json"
        label="File"
        onChange={fileSubmitHandle}
      />
      {props.csvContent !== null && props.contentPlain === null && (
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>{locale().file_content}</Accordion.Header>
            <Accordion.Body
              style={{
                overflow: "scroll",
                height: 70 + "vh",
                width: 1200 + "px",
              }}
            >
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    {React.Children.toArray(
                      props.csvContent[0].map((h) => {
                        return <th>{h}</th>;
                      })
                    )}
                  </tr>
                </thead>
                <tbody>
                  {React.Children.toArray(
                    props.csvContent.slice(1).map((e) => {
                      return (
                        <tr>
                          {React.Children.toArray(
                            e.map((h) => {
                              return <td>{h}</td>;
                            })
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
      {props.contentPlain !== null && props.csvContent === null && (
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>{locale().file_content}</Accordion.Header>
            <Accordion.Body style={{ overflow: "scroll", height: 70 + "vh" }}>
              <textarea
                style={{ resize: "both", width: 30 + "vw", height: 30 + "vh" }}
                //cols="120"
                //rows="10"
                readOnly
                value={props.contentPlain}
              ></textarea>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
      <Button variant="primary" type="submit" key={"submit"}>
        {locale().submit}
      </Button>
      &nbsp;&nbsp;&nbsp;
      <Button variant="secondary" key={"cancel"} onClick={props.backFunction}>
        {locale().cancel}
      </Button>
    </Form>
  );
};
