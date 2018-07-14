import { CHANGE_LOCALE } from "../cmds";

export const configureContext = (nextTick, intlFactory) => class extends HTMLElement {
    constructor() {
        super();

        this._intl = null;
        this._onChangeLocale = null;
    }

    connectedCallback() {
        // FIXME: How do we configure these with the <intl-context> markup?
        this._intl = intlFactory({
            defaultLocale: "en-US",
            defaultMessages: {
                "some.otherKey": "Great! {price, number, USD}",
                "some.placeholder": "Placeholder text...",
            },
            //includeLangSettings,
            supportedLocales: {
                "en": "en-US",
                "en-US": "en-US",
                "es": "es-ES",
                "es-ES": "es-ES",
            },
            loadTranslation: locale => Promise.resolve(
                {
                    "some.otherKey": "Que rico! {price, number, USD}",
                    "some.placeholder": "No se como se llama esto...",
                }
                //JSON.parse(
                //    document.querySelector(`[data-intl-locale="${locale}"]`).innerText
                //)
            ),
            locale: "es-ES",
            //setDocumentLang,
        });

        this._onChangeLocale = ({ detail = {} }) => {
            this._intl.changeLocale(detail.locale);
        };
        this.ownerDocument.addEventListener(
            CHANGE_LOCALE,
            this._onChangeLocale
        );
    }

    disconnectedCallback() {
        this.ownerDocument.removeEventListener(
            CHANGE_LOCALE,
            this._onChangeLocale
        );
        this._onChangeLocale = null;
        this._intl.dispose();
        this._intl = null;
    }
};

export const define = (registerElement, nextTick, intlFactory) => {
    registerElement("intl-context", configureContext(nextTick, intlFactory));
};
