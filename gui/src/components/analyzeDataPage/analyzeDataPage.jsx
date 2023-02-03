import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import { pages, pageActions, addFields } from "../../config";
import { get_generic, get_generic_pipe } from "../../services/http_operations";
import ContentTable from "../contentTable/contentTable";
import { useParams, useSearchParams } from "react-router-dom";
import { Pagination } from "react-bootstrap";
import "../page/page.scss";
import { convertJsonToCSV } from "../../services/misc_functions";
import fontawesome from "@fortawesome/fontawesome";
import { faPlusCircle, faDownload } from "@fortawesome/fontawesome-free-solid";
import { saveAs } from "file-saver";
import { tsConstructSignatureDeclaration } from "@babel/types";
fontawesome.library.add(faPlusCircle, faDownload);

//header for csv and table
const CSVheader = [
  "Luogo",
  "Mezzo",
  "Anni",
  "Sesso",
  "Nazionalità",
  "Data",
  "Ora",
  "Risultato",
  "Sostanza",
  "Livello",
  "Note",
];

export default function AnalyzeDataPage(params) {
  //const { page } = useParams();
  const page = "measurements";
  const [searchParams, setSearchParams] = useSearchParams();
  const [resource, setResource] = useState(undefined);
  const [header, setHeader] = useState(undefined);
  const [actions, setActions] = useState(undefined);

  const [pageNum, setPageNum] = useState(1);
  const [pageLimit, setPageLimit] = useState(1);

  const [hasNext, setHasNext] = useState();
  const [hasPrev, setHasPrev] = useState();

  const [prevPage, setPrevPage] = useState();
  const [nextPage, setNextPage] = useState();

  const [totalPages, setTotalPages] = useState();

  const [orderBy, setOrderBy] = useState("");
  const [isAscending, setIsAscending] = useState(false);

  useEffect(() => {
    // declare the async data fetching function
    const fetchData = async (qs = {}) => {
      // get the data from the api
      try {
        const response = await get_generic(page, qs);

        const samples = response.docs.map((d) => d.samples);

        const processedSamples = samples.map((control) => {
          if (control[0].values[9] === "positivo") {
            const report = control.filter(
              (person) => person.values[11] !== "nullo"
            );
            if (report.length === 0) {
              const ret = control[0];
              ret.values[10] = "Non specificato";
              ret.values[11] = "Non specificato";
              return ret;
            }
            return report;
          } else {
            const report = control[0];
            report.values[10] = "--";
            report.values[11] = "NA";
            return [report];
          }
        });

        const results = processedSamples
          .flat()
          .map((e) => e.values)
          .map((v) => {
            return {
              Luogo: v[0],
              Mezzo: v[4],
              Anni: v[6],
              Sesso: v[7],
              Nazionalità: v[8],
              Data: v[2],
              Ora: v[3],
              Risultato: v[9],
              Sostanza: v[10],
              Livello: v[11],
              Note: v[1],
            };
          });

        // set state with the result
        setHeader(CSVheader);

        setResource(results);
        setActions([]);
        setHasNext(response.hasNextPage);
        setHasPrev(response.hasPrevPage);

        setTotalPages(response.totalPages);

        setPrevPage(response.prevPage);
        setNextPage(response.nextPage);
      } catch (error) {
        console.log(error);

        setHeader(undefined);
        setResource(undefined);
        setHasNext(undefined);
        setHasPrev(undefined);
        setTotalPages(undefined);
        setPrevPage(undefined);
        setNextPage(undefined);
      }
    };

    const keys_of_entries = [
      "Luogo",
      "Note",
      "Data",
      "Ora",
      "Mezzo",
      "ID",
      "Anni",
      "Sesso",
      "Nazionalità",
      "Risultato",
      "Sostanza",
      "Livello",
    ];

    //get params for pagination
    const num =
      searchParams.get("page") !== null ? searchParams.get("page") : 1;
    setPageNum(num);

    const limit =
      searchParams.get("limit") !== null ? searchParams.get("limit") : 10;
    setPageLimit(limit);

    let sortBy =
      searchParams.get("sortBy") !== null ? searchParams.get("sortBy") : "";
    const order =
      searchParams.get("order") !== null ? searchParams.get("order") : "";

    if (sortBy !== "")
      sortBy = "samples.values." + keys_of_entries.indexOf(sortBy);
    const qs = { page: num, limit: limit, sort: { order: order, by: sortBy } };

    // call the function
    fetchData(qs)
      // make sure to catch any error
      .catch(console.error);
  }, [params, page, searchParams]);

  const takeSingle = (id) => {
    return resource.find((r) => r._id === id);
  };

  const removeSingle = (id) => {
    let tmp = resource.filter((el) => {
      return el._id !== id;
    });
    setResource(tmp);
  };

  const sortHandler = (e) => {
    let ord = searchParams.get("order");
    let asc = false;
    //toggle ordering
    if (ord === null) {
      ord = "descending";
    } else if (ord === "ascending") {
      ord = "descending";
    } else {
      ord = "ascending";
      asc = true;
    }

    //set searchparams
    searchParams.set("sortBy", e);
    searchParams.set("order", ord);

    setOrderBy(e);
    setIsAscending(asc);
    setSearchParams(searchParams);
  };

  const downloadDataHandler = async () => {
    const response = await get_generic_pipe("measurements", {});
    //correct response
    const regex = new RegExp(/}{/g);
    const test = response.data.replace(regex, "},{");

    //convert to JSON object and then extract all the values nested into arrays
    const JSONresponse = JSON.parse("[" + test + "]")
      .map((el) => el.samples)
      .map((control) => {
        if (control[0].values[9] === "positivo") {
          const report = control.filter(
            (person) => person.values[11] !== "nullo"
          );
          if (report.length === 0) {
            const ret = control[0];
            ret.values[10] = "Non specificato";
            ret.values[11] = "Non specificato";
            return ret;
          }
          return report;
        } else {
          const report = control[0];
          report.values[10] = "--";
          report.values[11] = "NA";
          return [report];
        }
      })
      .flat()
      .map((e) => e.values)
      .map((v) => {
        return {
          Luogo: v[0],
          Mezzo: v[4],
          Anni: v[6],
          Sesso: v[7],
          Nazionalità: v[8],
          Data: v[2],
          Ora: v[3],
          Risultato: v[9],
          Sostanza: v[10],
          Livello: v[11],
          Note: v[1],
        };
      });

    const CSVdata = convertJsonToCSV(JSONresponse, CSVheader);

    const csvBlob = new Blob([CSVdata], { type: "text/plain;charset=utf-8" });

    saveAs(csvBlob, "Dati_Pensaci_Prima.csv");
  };

  const RenderPagination = () => {
    const prevEllipsis = parseInt(pageNum, 10) - 2 > 0;
    const nextEllipsis = parseInt(pageNum, 10) + 2 < totalPages;

    return (
      <div style={{ display: "inline-flex", width: 100 + "%" }}>
        <Pagination
          style={{
            alignSelf: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Pagination.First
            disabled={pageNum === 1}
            onClick={() => {
              searchParams.set("page", 1);
              setSearchParams(searchParams);
            }}
          />
          <Pagination.Prev
            disabled={!hasPrev}
            onClick={() => {
              searchParams.set("page", prevPage);
              setSearchParams(searchParams);
            }}
          />
          {prevEllipsis && <Pagination.Ellipsis />}
          {parseInt(pageNum, 10) - 1 > 0 && (
            <Pagination.Item
              onClick={() => {
                searchParams.set("page", parseInt(pageNum, 10) - 1);
                setSearchParams(searchParams);
              }}
            >
              {parseInt(pageNum, 10) - 1}
            </Pagination.Item>
          )}
          <Pagination.Item>
            <b>{pageNum}</b>
          </Pagination.Item>
          {parseInt(pageNum, 10) + 1 <= totalPages && (
            <Pagination.Item
              onClick={() => {
                searchParams.set("page", parseInt(pageNum, 10) + 1);
                setSearchParams(searchParams);
              }}
            >
              {parseInt(pageNum, 10) + 1}
            </Pagination.Item>
          )}
          {nextEllipsis && <Pagination.Ellipsis />}

          <Pagination.Next
            disabled={!hasNext}
            onClick={() => {
              searchParams.set("page", parseInt(pageNum, 10) + 1);
              setSearchParams(searchParams);
            }}
          />
          <Pagination.Last
            disabled={pageNum === totalPages}
            onClick={() => {
              searchParams.set("page", totalPages);
              setSearchParams(searchParams);
            }}
          />
        </Pagination>
      </div>
    );
  };
  return (
    <div className="page">
      <header className="page-header">
        <b>Analizza dati raccolti</b>
        <Button
          variant="link"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            downloadDataHandler();
          }}
        >
          <i
            className="fa fa-download"
            aria-hidden="true"
            title={"Download"}
            style={{
              width: 30 + "px",
              height: 30 + "px",
              opacity: 0.85,
            }}
          ></i>
        </Button>
      </header>
      <main className="page-content">
        <br />
        <ContentTable
          resType={page}
          header={header}
          resources={resource}
          actions={actions}
          takeSingle={takeSingle}
          removeSingle={removeSingle}
          orderBy={orderBy}
          ascending={isAscending}
          sortHandler={sortHandler}
        />
        <RenderPagination />
      </main>
    </div>
  );
}
