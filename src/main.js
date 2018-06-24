import IntlMessageFormat from "intl-messageformat";

import { configureIntlElements } from "./core";
import { define as defineSpan } from "./elements/span";

const setDocumentLang = lang => {
    document.querySelector("html").setAttribute("lang", lang);

    const localeInclude = document.createElement("script");
    localeInclude.setAttribute(`data-intl-locale-include-${lang}`, "");
    localeInclude.src = `https://cdnjs.cloudflare.com/ajax/libs/intl-messageformat/2.2.0/locale-data/${lang}.js`;
    document.querySelector("head").appendChild(localeInclude);
};

const IntlElements = configureIntlElements(setDocumentLang);

defineSpan(IntlElements, window.customElements);

// We need to expose the constructor for dynamic locale data loading
window.IntlMessageFormat = IntlMessageFormat;

export default IntlElements;
