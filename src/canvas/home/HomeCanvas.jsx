import { Canvas } from '@react-three/fiber';
import { CANVAS_DPR, CANVAS_GL_DEFAULTS } from '@config/canvas.config';
import useAdaptiveQuality from '@hooks/useAdaptiveQuality';
import styles from '@routes/Home/Home.module.css';
import HomeScene from './HomeScene';

function AdaptiveQualityMonitor({ enabled = true }) {
    useAdaptiveQuality({ enabled });
    return null;
}

export default function HomeCanvas({ scrollProgress, startAnimations, laserParams, onSceneReady }) {
    return (
        <div className={styles.canvasContainer}>
            <Canvas
                dpr={CANVAS_DPR}
                performance={{ min: 0.5 }}
                eventSource={document.getElementById('root')}
                eventPrefix="client"
                gl={{
                    ...CANVAS_GL_DEFAULTS,
                    antialias: true,
                }}
            >
                <AdaptiveQualityMonitor enabled={startAnimations} />
                <HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} laserParams={laserParams} onSceneReady={onSceneReady} />
            </Canvas>
        </div>
    );
}
