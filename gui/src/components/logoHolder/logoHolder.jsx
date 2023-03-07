import React from "react";
import "../authPage/authPage.scss";

//this component define the top left logo section of the authpage, password recovery page and password reset page
export default function LogoHolder() {
  return (
    <React.Fragment>
      <div className="logo-section"></div>
      <div className="title-section">Measurify Dashboard</div> <br />
      <div className="subtitle-section">
        An IoT Framework to build powerful edge-cloud applications
      </div>
      <br />
      <div className="poweredtitle-section">
        Powered by&nbsp;
        <a target="_blank" href="https://measurify.org/">
          Measurify
        </a>
      </div>
    </React.Fragment>
  );
}
