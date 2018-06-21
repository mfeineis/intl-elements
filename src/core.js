import OriginalIntlMessageFormat from "intl-messageformat";
import memoizeFormatConstructor from "intl-format-cache";

import {
    defaultTo,
    forEach,
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

export const requestTranslation = (request, state, locale) => {
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

const switchTranslation = (api, config, state, locale) => (
    requestTranslation(config.requestTranslation, state, locale)
        .then(response => {
            const { fromCache, messages } = response;
            console.log(locale, "->", response);
            state.locale = locale;
            state.messages = patchMessages(
                state.allMessages[state.defaultLocale],
                messages,
            );
            state.isReady = true;
            return response;
        })
        .then(() => notifySubscribers(api, state.subscriptions))
        .then(() => (
            state.readySubscriptions = notifyReady(api, state.readySubscriptions)
        ))
        .catch(error => handleRequestError(error))
);

export const IntlElements = unsafeConfig => {
    const config = validateConfig(unsafeConfig);
    const defaultLocale = config.defaultLocale || DEFAULT_LOCALE;

    const state = {
        allMessages: {
            [defaultLocale]: config.defaultMessages || {},
        },
        defaultLocale,
        isReady: false,
        locale: defaultLocale,
        messages: config.defaultMessages,
        readySubscriptions: [],
        subscriptions: [],
    };

    const api = Object.assign(IntlElements, {
        //changeLocale: newLocale => switchTranslation(api, config, state, newLocale),
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
