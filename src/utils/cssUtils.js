export function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

export function getCSSColorRGBA(variableName) {
    const el = document.createElement('div');
    el.style.color = `var(${variableName})`;
    document.body.appendChild(el);
    const resolved = getComputedStyle(el).color;
    el.remove();

    const parts = resolved.match(/[\d.]+/g);
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
