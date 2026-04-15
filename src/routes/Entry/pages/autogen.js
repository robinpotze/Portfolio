import { normalizeKey } from '@utils/stringUtils';

const modules = import.meta.glob('./*/*.{jsx,js}', { eager: true });

// Group modules by directory so data files and component files are merged
const dirs = {};
for (const [path, mod] of Object.entries(modules)) {
    const dir = path.split('/')[1];
    if (!dirs[dir]) dirs[dir] = {};
    Object.assign(dirs[dir], mod);
}

const pages = Object.entries(dirs).reduce((acc, [, merged]) => {
    const Component = merged.default || null;
    const data = merged.Data || merged.data || {};

    if (!Component) {
        return acc;
    }

    const sourceName = data.title || Component.name;
    const key = normalizeKey(sourceName);

    acc[key] = { Component, data };
    return acc;
}, {});

if (import.meta.env.DEV) {
    for (const [key, { data }] of Object.entries(pages)) {
        if (!data.title) {
            // eslint-disable-next-line no-console
            console.warn(`[autogen] Page "${key}" is missing data.title`);
        }
    }
}

export { pages };
