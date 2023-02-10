import React from "react";
import { ReactComponent as Logo } from "../../resources/Hi_Drive_Logo_Claim_rgb.svg";
import "../authPage/authPage.scss";

//this component define the top left logo section of the authpage, password recovery page and password reset page
export default function LogoHolder() {
  return (
    <React.Fragment>
      <div className="logo-section">
        <Logo />
      </div>
      <div className="title-section">Measurify</div>
      <br />
      <div className="subtitle-section">
        Powered by&nbsp;
        <a target="_blank" href="https://measurify.org/">
          Measurify
        </a>
      </div>
    </React.Fragment>
  );
}
