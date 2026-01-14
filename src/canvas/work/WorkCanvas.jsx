import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, ScrollControls } from '@react-three/drei';
import WorkScene from './WorkScene';
import { CAROUSEL_CONFIG } from '@config/carousel';
import { calculateScrollPages } from '@utils/carousel';

export default function WorkCanvas({ items, onCardNavigate, onScrollChange }) {
    const pages = calculateScrollPages(items.length);

    return (
        <div className="work-canvas-container">
            <Canvas
                shadows
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: false
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={CAROUSEL_CONFIG.CAMERA.POSITION}
                    fov={CAROUSEL_CONFIG.CAMERA.FOV}
                />
                <ScrollControls pages={pages} damping={CAROUSEL_CONFIG.SCROLL_DAMPING}>
                    <WorkScene items={items} progress={1} onCardNavigate={onCardNavigate} onScrollChange={onScrollChange} />
                </ScrollControls>
            </Canvas>
        </div>
    );
}
