export function normalizeKey(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[\s-]+/g, '')
        .replace(/[^a-z0-9]/g, '');
}
