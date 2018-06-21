import { configureIntlElements } from "./core";
import { define as defineSpan } from "./elements/span";

const IntlElements = configureIntlElements(document);

defineSpan(IntlElements, window.customElements);

export default IntlElements;
