import { Canvas } from '@react-three/fiber';
import HomeScene from './HomeScene';

export default function HomeCanvas({ scrollProgress, startAnimations }) {
    return (
        <div className="home-canvas-container">
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
                <HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} />
            </Canvas>
        </div>
    );
}
