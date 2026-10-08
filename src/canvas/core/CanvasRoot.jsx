import { Canvas } from '@react-three/fiber';
import { CANVAS_DPR, CANVAS_GL_DEFAULTS } from './canvas.config';
import useAdaptiveQuality from './quality/useAdaptiveQuality';

function AdaptiveQualityMonitor({ enabled }) {
    useAdaptiveQuality({ enabled });
    return null;
}

/**
 * Shared R3F <Canvas>: project DPR and GL defaults plus the adaptive quality monitor.
 * `gl` is merged over CANVAS_GL_DEFAULTS; every other prop is forwarded to <Canvas>.
 */
export default function CanvasRoot({ adaptiveQuality = true, gl, children, ...canvasProps }) {
    return (
        <Canvas dpr={CANVAS_DPR} {...canvasProps} gl={{ ...CANVAS_GL_DEFAULTS, ...gl }}>
            <AdaptiveQualityMonitor enabled={adaptiveQuality} />
            {children}
        </Canvas>
    );
}
