import CanvasRoot from '@canvas/core/CanvasRoot';
import styles from './HomeCanvas.module.css';
import HomeScene from './HomeScene';

export default function HomeCanvas({ scrollProgressRef, startAnimations }) {
    return (
        <div className={styles.canvasContainer}>
            <CanvasRoot
                adaptiveQuality={startAnimations}
                performance={{ min: 0.5 }}
                eventSource={document.getElementById('root')}
                eventPrefix="client"
                gl={{ antialias: true }}
            >
                <HomeScene scrollProgressRef={scrollProgressRef} startAnimations={startAnimations} />
            </CanvasRoot>
        </div>
    );
}
