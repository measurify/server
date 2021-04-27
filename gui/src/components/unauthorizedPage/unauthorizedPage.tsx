import "./unauthorizedPage.scss";

import React, { useState, useEffect } from "react";
import locale from "../../common/locale";
import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";

const notAuthPageComp = () => {
  return (
    <div className="unAuth-page">
      <div className="info-box">
        <div className="info-text">{locale().unauthorised_user}</div>
      </div>
    </div>
  );
};

export const UnauthorizedPage = withAppContext(notAuthPageComp);
