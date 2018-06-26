
export const extractConfig = (it, intl) => {
    const json = JSON.parse(it.getAttribute("intl"));

    if (Array.isArray(json)) {
        return json;
    }

    return [json];
};

export const configureRenderer = selectWrapped => (it, intl) => {
    console.log("render", it, intl);
    const wrapped = selectWrapped(it);

    if (!wrapped) {
        return;
    }

    try {
        const cfgs = extractConfig(it, intl);

        // FIXME: Escape that user defined stuff!
        cfgs.forEach(cfg => {
            let translation = null;
            try {
                translation = intl.format(cfg.key, cfg.values, cfg.formats);
            } catch (e) {
                console.error("Translation failed: ", cfg, e);
            } finally {
                // FIXME: Find a nicer way to mark missing translations
                if (translation && wrapped.hasAttribute("data-intl-missing-translation")) {
                    wrapped.removeAttribute("data-intl-missing-translation");
                }
                if (!translation && !wrapped.hasAttribute("data-intl-missing-translation")) {
                    wrapped.setAttribute("data-intl-missing-translation", "true");
                }

                const value = translation || cfg.key;

                if (cfg.attribute) {
                    wrapped.setAttribute(cfg.attribute, value);
                } else {
                    wrapped.innerHTML = value;
                }
            }
        });
    } catch (e) {
        console.error("render error", e);
        throw e;
    }
};
