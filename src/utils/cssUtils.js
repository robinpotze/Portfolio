export function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

export function getCSSColorRGBA(variableName) {
    const str = getCSSVariable(variableName);
    if (str.startsWith('#')) {
        const hex = str.length === 4 ? str[1] + str[1] + str[2] + str[2] + str[3] + str[3] : str.slice(1);
        return {
            r: Number.parseInt(hex.slice(0, 2), 16),
            g: Number.parseInt(hex.slice(2, 4), 16),
            b: Number.parseInt(hex.slice(4, 6), 16),
            a: 1,
        };
    }
    const parts = str.match(/[\d.]+/g);
    if (!parts) {
        return { r: 255, g: 255, b: 255, a: 1 };
    }
    return {
        r: Number(parts[0]),
        g: Number(parts[1]),
        b: Number(parts[2]),
        a: parts[3] === undefined ? 1 : Number(parts[3]),
    };
}
