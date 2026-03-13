let cachedTier = null;

/**
 * Detect GPU tier using WebGL debug info.
 * Returns 'low' for integrated Intel/software renderers, 'high' for dedicated GPUs.
 */
export function getDeviceTier() {
    if (cachedTier) return cachedTier;

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            cachedTier = 'low';
            return cachedTier;
        }

        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
            const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).toLowerCase();

            // Intel integrated GPUs
            if (renderer.includes('intel')) {
                cachedTier = 'low';
                return cachedTier;
            }

            // Software / generic renderers
            if (
                renderer.includes('swiftshader') ||
                renderer.includes('llvmpipe') ||
                renderer.includes('software') ||
                renderer.includes('microsoft basic')
            ) {
                cachedTier = 'low';
                return cachedTier;
            }

            // Apple integrated (M-series are capable, older Intel Macs are not)
            if (renderer.includes('apple') && renderer.includes('gpu')) {
                cachedTier = 'high';
                return cachedTier;
            }
        }

        // Fallback: check CPU core count
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
            cachedTier = 'low';
            return cachedTier;
        }
    } catch {
        // WebGL not available or blocked
    }

    cachedTier = cachedTier || 'high';
    return cachedTier;
}

/**
 * Map device tier to initial quality level.
 */
export function getInitialQuality() {
    const tier = getDeviceTier();
    return tier === 'low' ? 'low' : 'high';
}
