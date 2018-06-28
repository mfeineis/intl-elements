
export const extractConfig = (it, intl) => {
    const json = JSON.parse(it.getAttribute("intl"));

    if (Array.isArray(json)) {
        return json;
    }

    return [json];
};

const slice = Array.prototype.slice;

export const selectCandidate = (it, selector) => {
    //console.log("defaultCandidate", it, selector);

    if (selector) {
        const nodes = it.querySelectorAll(selector);
        const sliced = slice.call(nodes);
        const result = sliced || [it];
        //console.log("with selector", selector, nodes, sliced, result);
        return result;
    }

    if (it.children && it.children.length) {
        //console.log("first child", it.children[0], it.children);
        return [it.children[0]];
    }

    //console.log("just it", it);
    return [it];
};

export const render = (it, intl) => {
    console.log("render", it, intl);

    try {
        const cfgs = extractConfig(it, intl);

        // FIXME: Escape that user defined stuff!
        cfgs.forEach(cfg => {
            const nodes = selectCandidate(it, cfg.select);

            //console.log("nodes", nodes.length, nodes);

            if (!nodes) {
                return;
            }

            let translation = null;
            try {
                translation = intl.format(cfg.key, cfg.values, cfg.formats);
            } catch (e) {
                console.error("Translation failed: ", cfg, e);
            } finally {
                nodes.forEach(node => {
                    // FIXME: Find a nicer way to mark missing translations
                    if (translation && node.hasAttribute("data-intl-missing-translation")) {
                        node.removeAttribute("data-intl-missing-translation");
                    }
                    if (!translation && !node.hasAttribute("data-intl-missing-translation")) {
                        node.setAttribute("data-intl-missing-translation", "true");
                    }

                    const value = translation || cfg.key;

                    if (cfg.attribute) {
                        node.setAttribute(cfg.attribute, value);
                    } else {
                        node.innerHTML = value;
                    }
                });
            }
        });
    } catch (e) {
        console.error("render error", e);
        throw e;
    }
};
