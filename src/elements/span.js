
export const extractConfig = (it, intl) => JSON.parse(it.getAttribute("intl"));

export const render = (it, intl) => {
    try {
        const cfg = extractConfig(it, intl);
        const translation = intl.format(cfg.key, cfg.values, cfg.formats);

        // FIXME: Find a nicer way to mark missing translations
        if (translation && it.hasAttribute("data-intl-missing-translation")) {
            it.removeAttribute("data-intl-missing-translation");
        }
        if (!translation && !it.hasAttribute("data-intl-missing-translation")) {
            it.setAttribute("data-intl-missing-translation", "true");
        }

        // FIXME: Maybe use something different than `innerHTML` for rendering
        it.innerHTML = translation || cfg.key;
    } catch (e) {
        console.error("render error", e);
        throw e;
    }
};

export const configureSpan = (intl, nextTick) => class IntlSpan extends HTMLElement {
    static get observedAttributes() {
        return ["intl"];
    }

    constructor() {
        super();

        this._dispose = () => {};
        this._fingerprint = null;
    }

    attributeChangedCallback(name, oldValue, value) {
        switch (name) {
        case "intl":
            if (this._fingerprint !== value) {
                this._fingerprint = value;
                render(this, intl);
            } else {
                console.log("attributeChangedCallback: fingerprint didn't change");
            }
            return;
        default:
            throw new Error(`FATAL: Attribute "${name}" should not be watched!`);
        }
    }

    connectedCallback() {
        this._dispose = intl.subscribe(
            () => render(this, intl)
        );
        nextTick(() => render(this, intl));
    }

    disconnectedCallback() {
        this._dispose();
        this._dispose = null;
        this._fingerprint = null;
    }
};

export const define = (intl, registerElement, nextTick) => {
    const IntlSpan = configureSpan(intl, nextTick);
    registerElement("intl-span", IntlSpan);
};

