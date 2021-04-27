import React, { useState, useEffect } from "react";
import locale from "../../common/locale";
import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";

import "./notFoundPage.scss";

const notFoundPageComp = () => {
  return (
    <div className="notFound-page">
      <div className="info-box">
        <div className="info-text">
          {locale().oh_no}
          <br />
          <br />
          {locale().broken_link}
          <br />
          <br />
          <a
            href="https://github.com/measurify/server/issues"
            target="_blank"
            title="https://github.com/measurify/server/issues"
          >
            {locale().github_issue_page_hp}
          </a>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage = withAppContext(notFoundPageComp);
