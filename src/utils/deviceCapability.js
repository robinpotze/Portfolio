/**
 * Detect GPU tier using WebGL debug info.
 * Returns 'low' for integrated Intel/software renderers, 'high' for dedicated GPUs.
 */
export function getDeviceTier() {
    let gl = null;
    try {
        gl = document.createElement('canvas').getContext('webgl');
        if (!gl) {
            return 'low';
        }

        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
            const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).toLowerCase();

            // Intel integrated GPUs, and software / generic renderers
            if (['intel', 'swiftshader', 'llvmpipe', 'software', 'microsoft basic'].some((name) => renderer.includes(name))) {
                return 'low';
            }

            // Apple integrated (M-series are capable, older Intel Macs are not)
            if (renderer.includes('apple') && renderer.includes('gpu')) {
                return 'high';
            }
        }

        // Fallback: check CPU core count
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
            return 'low';
        }
    } catch {
        // WebGL not available or blocked
    } finally {
        // Free the probe context now: browsers cap live WebGL contexts (Chrome: 16).
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
    }
    return 'high';
}

/**
 * Map device tier to initial quality level.
 */
export function getInitialQuality() {
    const tier = getDeviceTier();
    return tier === 'low' ? 'low' : 'high';
}
