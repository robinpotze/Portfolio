import { normalizeKey } from '@utils/stringUtils';

const modules = import.meta.glob('./**/*.{jsx,js}', { eager: true });

const pages = Object.entries(modules).reduce((acc, [path, mod]) => {
    const Component = mod && mod.default ? mod.default : null;
    const data = (mod && (mod.Data || mod.data)) || {};

    if (!Component) {
        return acc;
    }

    const filename = String(path)
        .split('/')
        .pop()
        .replace(/\.[^/.]+$/, '');
    const sourceName = data && data.title ? data.title : Component.name || filename;
    const key = normalizeKey(sourceName);

    acc[key] = { Component, data };
    return acc;
}, {});

export { pages };
