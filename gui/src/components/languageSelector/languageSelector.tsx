import React from "react";
import { Button } from "../button/button.comp";
import locale from "../../common/locale";

import "./languageSelector.scss";

export const LanguageSelector = () => {
  function setSessionLanguage(language: string) {
    sessionStorage.setItem("diten-language", language);
    window.location.reload();
  }
  return (
    <div>
      {locale().language}
      <div>
        <Button
          outlined="outlined"
          title="It"
          onClick={() => setSessionLanguage("it")}
        >
          Ita
        </Button>
        <Button
          outlined="outlined"
          title="En"
          onClick={() => setSessionLanguage("en")}
        >
          Eng
        </Button>
      </div>
    </div>
  );
  //
};
