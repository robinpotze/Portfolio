import { Canvas } from '@react-three/fiber';
import styles from '@routes/Home/Home.module.css';
import HomeScene from './HomeScene';

export default function HomeCanvas({ scrollProgress, startAnimations, laserParams }) {
    return (
        <div className={styles.canvasContainer}>
            <Canvas
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
                eventSource={document.getElementById('root')}
                eventPrefix="client"
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: false,
                    alpha: false,
                    stencil: false,
                }}
            >
                <HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} laserParams={laserParams} />
            </Canvas>
        </div>
    );
}
