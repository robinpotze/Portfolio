import { useQuality } from '@app/QualityContext';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function Rig({ intensity = 0.5 }) {
    const offsetRef = useRef({ x: 0, y: 0, z: 0 });
    const basePosRef = useRef({ x: 0, y: 0, z: 0 });
    const previousOffsetRef = useRef({ x: 0, y: 0, z: 0 });
    const frameCount = useRef(0);
    const { quality } = useQuality();

    useFrame((state, delta) => {
        const skipInterval = quality === 'low' ? 3 : quality === 'medium' ? 2 : 1;
        frameCount.current++;
        if (frameCount.current % skipInterval !== 0) {
            return;
        }
        const targetOffsetX = Math.sin(-state.pointer.x) * 5 * intensity;
        const targetOffsetY = state.pointer.y * 5 * intensity;
        const targetOffsetZ = Math.cos(state.pointer.x) * 5 * intensity;

        const smoothing = Math.min(1 - Math.pow(0.001, delta), 1) * 0.5;

        // Lerp offsets
        offsetRef.current.x += (targetOffsetX - offsetRef.current.x) * smoothing;
        offsetRef.current.y += (targetOffsetY - offsetRef.current.y) * smoothing;
        offsetRef.current.z += (targetOffsetZ - offsetRef.current.z) * smoothing;

        // Remove previous offset to get base position, then add new offset
        // This prevents offset accumulation and preserves animation-driven position changes
        basePosRef.current.x = state.camera.position.x - previousOffsetRef.current.x;
        basePosRef.current.y = state.camera.position.y - previousOffsetRef.current.y;
        basePosRef.current.z = state.camera.position.z - previousOffsetRef.current.z;

        // Apply new offset
        state.camera.position.set(
            basePosRef.current.x + offsetRef.current.x,
            basePosRef.current.y + offsetRef.current.y,
            basePosRef.current.z + offsetRef.current.z
        );

        // Store current offset for next frame
        previousOffsetRef.current.x = offsetRef.current.x;
        previousOffsetRef.current.y = offsetRef.current.y;
        previousOffsetRef.current.z = offsetRef.current.z;

        state.camera.lookAt(0, 0, 0);
    });

    return null;
}
