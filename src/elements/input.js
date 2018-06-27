import { configureRenderer } from "../render";

export const configureElement = (intl, nextTick, createNode, attrs) => {
    const render = configureRenderer(it => it._node);

    return class extends HTMLElement {
        static get observedAttributes() {
            return ["intl"].concat(attrs);
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
            this._node = createNode();
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
            this.removeChild(this._node);
            this._node = null;
        }

        removeEventListener(topic, callback) {
            this._node && this._node.removeEventListener(topic, callback);
        }
    };
};

export const define = (intl, registerElement, nextTick) => {
    registerElement("intl-text-input", configureElement(
        intl,
        nextTick,
        () => {
            const node = document.createElement("input");
            node.setAttribute("type", "text");
            return node;
        },
        [
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
        ],
    ));
    registerElement("intl-textarea", configureElement(
        intl,
        nextTick,
        () => document.createElement("textarea"),
        [
            "autocomplete",
            "autofocus",
            "cols",
            "disabled",
            "form",
            "maxlength",
            "minlength",
            "name",
            "readonly",
            "required",
            "rows",
            "spellcheck",
            "tabindex",
            "title",
            "value",
            "wrap",
        ],
    ));
};

