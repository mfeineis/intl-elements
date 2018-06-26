
export const extractConfig = (it, intl) => JSON.parse(it.getAttribute("intl"));

export const render = (it, intl) => {
    console.log("<intl-input>.render", it, intl);

    if (!it._node) {
        return;
    }

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

        it._node.setAttribute(cfg.attribute || "placeholder", translation || cfg.key);
    } catch (e) {
        console.error("<intl-input>.render error", e);
        throw e;
    }
};

export const configureElement = (intl, nextTick) => class extends HTMLElement {
    static get observedAttributes() {
        return [
            "intl",
            "accept",
            "autocomplete",
            "autofocus",
            "disabled",
            "form",
            "inputmode",
            "list",
            "maxlength",
            "minlength",
            "name",
            "pattern",
            "readonly",
            "required",
            "selectionDirection",
            "size",
            "spellcheck",
            "tabindex",
            "title",
            "value",
        ];
    }

    constructor() {
        super();

        this._dispose = () => {};
        this._fingerprint = null;
        this._node = null;
    }

    addEventListener(topic, callback, options) {
        this._node && this._node.addEventListener(topic, callback, options);
    }

    attributeChangedCallback(name, oldValue, value) {
        switch (name) {
        case "intl":
            if (this._fingerprint !== value) {
                this._fingerprint = value;
                render(this, intl);
            } else {
                console.info("attributeChangedCallback: fingerprint didn't change");
            }
            return;
        default:
            this._node && this._node.setAttribute(name, value);
            return;
        }
    }

    connectedCallback() {
        this._node = document.createElement("input");
        this._node.setAttribute("type", "text");

        this.appendChild(this._node);

        this._dispose = intl.subscribe(
            () => render(this, intl)
        );
        nextTick(() => render(this, intl));
    }

    disconnectedCallback() {
        this._dispose();
        this._dispose = null;
        this._fingerprint = null;
        this._node = null;
    }

    removeEventListener(topic, callback) {
        this._node && this._node.removeEventListener(topic, callback);
    }
};

export const define = (intl, registerElement, nextTick) => {
    const Element = configureElement(intl, nextTick);
    registerElement("intl-text-input", Element);
};

