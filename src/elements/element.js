import { render } from "../render";

const observerConfig = {
    attributes: true,
    childList: true,
    subtree: true,
};

export const configureElement = (intl, nextTick) => class extends HTMLElement {
    static get observedAttributes() {
        return ["intl"];
    }

    constructor() {
        super();

        this._observer = null;
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
        console.log("<intl-element>.connectedCallback", this.children);

        // FIXME: Maybe having the `MutationObserver` is overkill?
        this._observer = new MutationObserver(list => {
            //console.log("> mutations on ", this, ":", list);
            //console.log('>>> A child or subtree node has been added or removed.');

            this._observer.disconnect();

            nextTick(() => {
                render(this, intl);
                this._observer.observe(this, observerConfig);
            });
        });
        this._observer.observe(this, observerConfig);

        this._dispose = intl.subscribe(
            () => render(this, intl)
        );
        nextTick(() => render(this, intl));
    }

    disconnectedCallback() {
        this._observer.disconnect();
        this._observer = null;
        this._dispose();
        this._dispose = null;
        this._fingerprint = null;
    }
};

export const define = (intl, registerElement, nextTick) => {
    const Element = configureElement(intl, nextTick);
    registerElement("intl-element", Element);
};

