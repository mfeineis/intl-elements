import { IntlElements } from "../core";

export const render = (it, intl) => {
    const cfg = JSON.parse(it.getAttribute('intl'));
    const translation = intl.format(cfg.key, cfg.values);

    if (translation && it.hasAttribute('data-intl-missing-translation')) {
        it.removeAttribute('data-intl-missing-translation');
    } else {
        it.setAttribute('data-intl-missing-translation', '');
    }

    it.innerHTML = translation || cfg.key;
};

export class IntlSpan extends HTMLElement {
    static get observedAttributes() {
        return ['intl'];
    }

    constructor() {
        super();

        this._dispose = () => {};
    }

    attributeChangedCallback(name, oldValue, value) {}

    connectedCallback() {
        this._dispose = IntlElements.subscribe(intl => render(this, intl));
        render(this, IntlElements);
    }

    disconnectedCallback() {
        this._dispose();
    }
}

export const setup = customElements => (
    customElements.define('intl-span', IntlSpan)
);
