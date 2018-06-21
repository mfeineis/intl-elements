import OriginalIntlMessageFormat from "intl-messageformat";
import memoizeFormatConstructor from "intl-format-cache";

import {
    defaultTo,
    forEach,
    has,
    head,
    pipe,
    split,
    without,
} from "ramda";

const IntlMessageFormat = memoizeFormatConstructor(OriginalIntlMessageFormat);

export const DEFAULT_LOCALE = "en-US";

export const extractLanguage = pipe(
    defaultTo(DEFAULT_LOCALE),
    split("-"),
    head,
);

export const DEFAULT_LANG = extractLanguage(DEFAULT_LOCALE);

// FIXME: Acutally validate configuration
export const validateConfig = config => config;

// FIXME: Actually patch messages
export const patchMessages = (defaultMessages, messages) => messages;

export const requestTranslation = (request, support, state, desiredLocale) => {
    const locale = support[desiredLocale];

    if (state.allMessages[locale]) {
        return Promise.resolve({
            fromCache: true,
            locale,
            messages: state.allMessages[locale],
        });
    }

    return request(locale).then(messages => {
        state.allMessages[locale] = messages;
        return {
            fromCache: false,
            locale,
            messages,
        };
    });
};

export const notifySubscribers = (api, subscriptions) => (
    forEach(notify => notify(api), subscriptions)
);

// FIXME: Actually handle error
export const handleRequestError = error => console.error(error);

// FIXME: Actually validate subscription
export const validateSubscription = sub => sub;

export const notifyReady = (api, subscriptions) => {
    forEach(notify => notify(api), subscriptions);
    return [];
};

export const switchTranslation = (api, config, state, desiredLocale) => (
    requestTranslation(
        config.requestTranslation,
        config.supportedLocales,
        state,
        desiredLocale
    ).then(response => {
        const { fromCache, locale, messages } = response;
        console.log(locale, "->", response);
        const patched = patchMessages(
            state.allMessages[state.defaultLocale] || {},
            messages,
        );

        state.locale = locale;
        state.messages = patched;
        state.allMessages[locale] = patched;

        const lang = extractLanguage(locale);
        const isDefaultForLang = config.supportedLocales[lang] === locale;

        if (isDefaultForLang || !state.allMessages[lang]) {
            state.allMessages[lang] = patched;
        }

        state.isReady = true;
        return response;
    }).then(response => {
            notifySubscribers(api, state.subscriptions);
            return response;
        })
        .then(({ locale }) => {
            state.readySubscriptions = notifyReady(api, state.readySubscriptions);
            return locale;
        })
        .catch(error => handleRequestError(error))
);

export const sanitizeLocale = (support, defaultLocale, locale) => pipe(
    it => has(it, support) ? it : extractLanguage(it),
    it => has(it, support) ? support[it] : support[defaultLocale],
    defaultTo(DEFAULT_LOCALE),
)(locale);

export const configureIntlElements = document => unsafeConfig => {
    const config = validateConfig(unsafeConfig);
    const defaultLocale = config.defaultLocale || DEFAULT_LOCALE;

    const state = {
        allMessages: {
            [extractLanguage(defaultLocale)]: config.defaultMessages,
            [defaultLocale]: config.defaultMessages,
        },
        defaultLocale,
        isReady: false,
        locale: defaultLocale,
        messages: config.defaultMessages,
        readySubscriptions: [],
        subscriptions: [],
    };

    const api = Object.assign(IntlElements, {
        // FIXME: Remove internals in production
        __config__: config,
        __state__: state,
        changeLocale: unsafeLocale => {
            const newLocale = sanitizeLocale(
                config.supportedLocales,
                defaultLocale,
                unsafeLocale,
            );
            return switchTranslation(api, config, state, newLocale);
        },
        format: (key, values) => {
            // FIXME: Validate message is really there
            const message = state.messages[key];
            return new IntlMessageFormat(message, state.locale).format(values);
        },
        ready: unsafeCallback => {
            const callback = validateSubscription(unsafeCallback);

            if (state.isReady) {
                callback(api);
            } else {
                state.readySubscriptions.push(callback);
            }
        },
        subscribe: unsafeOnChange => {
            const onChange = validateSubscription(unsafeOnChange);

            state.subscriptions.push(onChange);

            onChange(api);

            return () => (
                state.subscriptions = without(onChange, state.subscriptions)
            );
        },
    });

    switchTranslation(api, config, state, config.locale || defaultLocale);

    return api;
};

