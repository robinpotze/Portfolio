export function parseDate(val) {
    if (val == null) {
        return -Infinity;
    }
    const n = Number(val);
    if (Number.isFinite(n) && String(val).length === 4) {
        return new Date(n, 0, 1).getTime();
    }
    const p = Date.parse(String(val));
    return Number.isFinite(p) ? p : -Infinity;
}

export function sortItems(pages) {
    return Object.entries(pages || {})
        .map(([key, val]) => ({ key, data: val?.data || {} }))
        .sort((a, b) => {
            const aDate = parseDate(a.data.date ?? a.data.year);
            const bDate = parseDate(b.data.date ?? b.data.year);
            if (aDate !== bDate) {
                return bDate - aDate;
            }
            return (a.data.id || 0) - (b.data.id || 0);
        });
}
