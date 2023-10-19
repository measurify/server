import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import { pages, pageActions, addFields } from "../../configManager";
import { get_generic } from "../../services/http_operations";
import ContentTable from "../contentTable/contentTable";
import { useParams, useSearchParams } from "react-router-dom";
import "./page.scss";
import { Capitalize } from "../../services/misc_functions";
import { canDo } from "../../services/userRolesManagement";
import AppContext from "../../context";
import RenderPagination from "../pagination/renderPagination";

let role = React.createRef();

export default function Page(params) {
  const { page } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resource, setResource] = useState(undefined);
  const [header, setHeader] = useState(undefined);
  const [_actions, set_Actions] = useState(undefined);

  const [paginationInfos, setPaginationInfos] = useState(undefined);

  const rl = localStorage.getItem("user-role");

  role.current = rl !== null ? rl : "";

  const context = useContext(AppContext);
  let myFetched;
  if (context !== undefined) myFetched = context.fetched;
  else myFetched = {};

  useEffect(() => {
    // declare the async data fetching function
    const fetchData = async (qs = {}) => {
      // get the data from the api
      try {
        const res = await get_generic(page, qs);

        // set state with the result
        setHeader(pages[page]);
        setResource(res.docs);
        if (pageActions[page] !== undefined) set_Actions(pageActions[page]);

        delete res.docs;
        delete res.response;

        setPaginationInfos(res);
      } catch (error) {
        console.error(error);

        setHeader(undefined);
        setResource(undefined);
      }
    };

    //get params for pagination
    const num =
      searchParams.get("page") !== null ? searchParams.get("page") : 1;

    const limit =
      searchParams.get("limit") !== null ? searchParams.get("limit") : 10;

    const qs = { page: num, limit: limit };

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
    myFetched.RemoveData(page);
    setResource(tmp);
  };

  return (
    <div className="page">
      <header className="page-header">
        {Capitalize(page)}

        {addFields[page] !== undefined &&
          canDo(role.current, page, "create") && (
            <NavLink to={`/add/` + page + "/"} key={page + "_add_navlink"}>
              <Button variant="link" size="sm" key={page + "button"}>
                <i
                  key={page + "icon"}
                  className="fa fa-plus-circle"
                  aria-hidden="true"
                  title={"Add"}
                  style={{
                    width: 30 + "px",
                    height: 30 + "px",
                    marginRight: 10 + "px",
                    opacity: 0.85,
                  }}
                ></i>
              </Button>
            </NavLink>
          )}
      </header>
      <main className="page-content">
        <ContentTable
          resType={page}
          userRole={role.current}
          header={header}
          resources={resource}
          _actions={_actions}
          takeSingle={takeSingle}
          removeSingle={removeSingle}
        />
        <RenderPagination
          setSearchParams={setSearchParams}
          paginationInfos={paginationInfos}
        />
      </main>
    </div>
  );
}
