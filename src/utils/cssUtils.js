/**
 * CSS Variable Utilities
 * 
 * Provides JavaScript access to CSS custom properties (design tokens) defined in index.css.
 * Essential for integrating design system values with Three.js materials, Canvas API, and dynamic styling.
 * 
 * @module utils/cssUtils
 */

/**
 * Retrieves a CSS custom property value from the document root
 * 
 * @param {string} variableName - The CSS custom property name (must include -- prefix)
 * @returns {string} The computed CSS variable value
 * 
 * @example
 * // Get spacing token
 * const spacing = getCSSVariable('--space-4'); // Returns "1rem"
 * 
 * @example
 * // Get breakpoint value for JavaScript media queries
 * const mobileBreakpoint = getCSSVariable('--bp-mobile'); // Returns "768px"
 * 
 * @example
 * // Get component size for dynamic calculations
 * const logoSize = getCSSVariable('--comp-logo-size'); // Returns "4rem"
 */
export function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
}

/**
 * Retrieves a CSS color token as a string suitable for Three.js and Canvas API
 * 
 * Automatically handles color conversion and provides fallback for missing variables.
 * Supports hex colors, rgb/rgba values, and CSS color keywords.
 * 
 * @param {string} variableName - The CSS color variable name (must include -- prefix)
 * @returns {string} Color value (hex, rgb, or fallback '#ffffff')
 * 
 * @example
 * // Three.js material integration
 * import { getCSSColor } from '@utils/cssVariables';
 * import * as THREE from 'three';
 * 
 * const material = new THREE.MeshStandardMaterial({
 *   color: getCSSColor('--color-primary'),     // Brand color
 *   emissive: getCSSColor('--color-primary'),  // Emissive glow
 *   emissiveIntensity: 0.5
 * });
 * 
 * @example
 * // React component prop (JSX integration)
 * import { getCSSColor } from '@utils/cssVariables';
 * 
 * function MyComponent() {
 *   return <LaserFlow color={getCSSColor('--color-primary')} />;
 * }
 * 
 * @example
 * // Canvas 2D context
 * const ctx = canvas.getContext('2d');
 * ctx.fillStyle = getCSSColor('--color-contrast');
 * ctx.strokeStyle = getCSSColor('--color-on-surface');
 * 
 * @example
 * // Dynamic theme switching
 * const glowColor = isDarkMode 
 *   ? getCSSColor('--color-on-surface') 
 *   : getCSSColor('--color-surface');
 * 
 * @example
 * // Fallback handling
 * const color = getCSSColor('--nonexistent-var'); // Returns '#ffffff' if variable not found
 */
export function getCSSColor(variableName) {
    const color = getCSSVariable(variableName);
    return color || '#ffffff';
}
