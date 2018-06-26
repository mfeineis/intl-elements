import { configureRenderer } from "../render";

export const configureElement = (intl, nextTick) => {
    const render = configureRenderer(it => it);

    return class extends HTMLElement {
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
                    console.info("attributeChangedCallback: fingerprint didn't change");
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
};

export const define = (intl, registerElement, nextTick) => {
    const Element = configureElement(intl, nextTick);
    registerElement("intl-span", Element);
};

