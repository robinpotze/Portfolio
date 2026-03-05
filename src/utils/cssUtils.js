export function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
}

export function getCSSColor(variableName) {
    const color = getCSSVariable(variableName);
    return color || '#ffffff';
}
