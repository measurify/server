import React, { useState, useEffect } from "react";
import locale from "../../common/locale";
import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";

import "./homePage.scss";

const HomePageComp = () => {
  useEffect(() => {});
  return (
    <div className="home-page">
      <div className="info-box">
        <div className="info-text">
          {locale().welcome_hp}
          <br />
          <br />
          {locale().left_bar_descr_hp}
          <br />
          <br />
          {locale().right_bar_descr_hp}
          <br />
          <br />
          {locale().session_expire_info_hp}
          <br />
          <br />
          <a
            href="https://github.com/measurify/server/tree/r2.0"
            target="_blank"
            title="https://github.com/measurify/server/tree/r2.0"
          >
            {locale().github_page_hp}
          </a>
          <br />
          <br />
          <a
            href="https://github.com/measurify/server/issues"
            target="_blank"
            title="https://github.com/measurify/server/issues"
          >
            {locale().github_issue_page_hp}
          </a>
          <br />
        </div>
      </div>
    </div>
  );
};

export const HomePage = withAppContext(HomePageComp);
