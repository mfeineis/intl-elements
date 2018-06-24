import IntlMessageFormat from "intl-messageformat";

import { configureCore } from "./core";
import { define as defineSpan } from "./elements/span";

const setDocumentLang = lang => {
    document.querySelector("html").setAttribute("lang", lang);
};

const TAG = `intl-${Date.now()}-${String(Math.random()).replace(/\D/g, '')}`;

const includeLangSettings = lang => {
    const attr = `data-intl-locale-include-${lang}-${TAG}`;
    if (document.querySelector(`[${attr}]`)) {
        return;
    }

    const localeInclude = document.createElement("script");
    localeInclude.setAttribute(attr, "");
    localeInclude.src = `https://cdnjs.cloudflare.com/ajax/libs/intl-messageformat/2.2.0/locale-data/${lang}.js`;
    document.querySelector("head").appendChild(localeInclude);
};

const IntlElements = configureCore({
    includeLangSettings,
    setDocumentLang,
});

const registerElement = (tag, Element) => (
    window.customElements.define(tag, Element)
);

// FIXME: `nextTick` shouldn't be necessary, remove it!
const nextTick = fn => window.setTimeout(fn, 1);

defineSpan(IntlElements, registerElement, nextTick);

// We need to expose the constructor for dynamic locale data loading
window["IntlMessageFormat"] = IntlMessageFormat;

export default IntlElements;
