import OriginalIntlMessageFormat from "intl-messageformat";
import memoizeFormatConstructor from "intl-format-cache";

const IntlMessageFormat = memoizeFormatConstructor(OriginalIntlMessageFormat);

export const IntlElements = config => {
    const { requestTranslation } = config;

    const state = {
        locale: config.defaultLocale || "en-US",
        messages: config.defaultMessages,
    };

    return Object.assign(IntlElements, {
        //changeLocale: newLocale => Promise.resolve(null),
        format: (key, values) => {
            const message = state.messages[key];
            return new IntlMessageFormat(message, state.locale).format(values);
        },
        //ready: fn => {},
        subscribe: onChange => () => {},
    });
};
