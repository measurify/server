import React from "react";
import { Button } from "../button/button.comp";

import "./languageSelector.scss";

export const LanguageSelector = () => {
  function setSessionLanguage(language: string) {
    sessionStorage.setItem("language-token", language);
    window.location.reload();
  }
  return (
    <div className="languageSelector">
      <div>
        <h4>Language</h4>
      </div>
      <div>
        <Button title="Italiano" onClick={() => setSessionLanguage("it")}>
          Italiano
        </Button>
        <Button title="English" onClick={() => setSessionLanguage("en")}>
          English
        </Button>
      </div>
    </div>
  );
  //
};
