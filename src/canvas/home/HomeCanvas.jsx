import { Canvas } from '@react-three/fiber';
import { CANVAS_DPR, CANVAS_GL_DEFAULTS } from '@config/canvas.config';
import styles from '@routes/Home/Home.module.css';
import HomeScene from './HomeScene';

export default function HomeCanvas({ scrollProgress, startAnimations, laserParams }) {
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
                <HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} laserParams={laserParams} />
            </Canvas>
        </div>
    );
}
