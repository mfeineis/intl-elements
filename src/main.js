import { configureIntlElements } from "./core";
import { define as defineSpan } from "./elements/span";

const setDocumentLang = lang => (
    document.querySelector("html").setAttribute("lang", lang)
);

const IntlElements = configureIntlElements(setDocumentLang);

defineSpan(IntlElements, window.customElements);

export default IntlElements;
