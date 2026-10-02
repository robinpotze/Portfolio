import CanvasRoot from '@canvas/core/CanvasRoot';
import styles from '@routes/Home/Home.module.css';
import HomeScene from './HomeScene';

export default function HomeCanvas({ scrollProgress, startAnimations, onSceneReady }) {
    return (
        <div className={styles.canvasContainer}>
            <CanvasRoot
                adaptiveQuality={startAnimations}
                performance={{ min: 0.5 }}
                eventSource={document.getElementById('root')}
                eventPrefix="client"
                gl={{ antialias: true }}
            >
                <HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} onSceneReady={onSceneReady} />
            </CanvasRoot>
        </div>
    );
}
