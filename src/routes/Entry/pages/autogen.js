import { normalizeKey } from '@utils/stringUtils';
import { lazy } from 'react';

// Data files loaded eagerly (lightweight metadata)
const dataModules = import.meta.glob('./*/*.data.{js,jsx}', { eager: true });

// Component files loaded lazily (heavy JSX, split per page)
const componentLoaders = import.meta.glob(['./*/*.jsx', '!./*/*.data.jsx']);

// Group data by directory
const dataByDir = {};
for (const [path, mod] of Object.entries(dataModules)) {
    const dir = path.split('/')[1];
    dataByDir[dir] = mod.Data || mod.data || {};
}

// Map component loaders by directory (skip data files if any matched)
const loaderByDir = {};
for (const [path, loader] of Object.entries(componentLoaders)) {
    if (path.includes('.data.')) {
        continue;
    }
    const dir = path.split('/')[1];
    loaderByDir[dir] = loader;
}

// Full pages map with lazy components (for Entry.jsx)
const pages = {};
// Data-only map (for WorkContext / App.jsx)
const pagesData = {};

for (const [dir, data] of Object.entries(dataByDir)) {
    const loader = loaderByDir[dir];
    if (!loader) {
        continue;
    }

    const sourceName = data.title || dir;
    const key = normalizeKey(sourceName);

    const Component = lazy(loader);
    pages[key] = { Component, data };
    pagesData[key] = { data };
}

if (import.meta.env.DEV) {
    for (const [key, { data }] of Object.entries(pages)) {
        if (!data.title) {
            // eslint-disable-next-line no-console
            console.warn(`[autogen] Page "${key}" is missing data.title`);
        }
    }
}

export { pages, pagesData };
