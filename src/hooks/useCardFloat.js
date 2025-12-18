import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CAROUSEL_CONFIG, calculateFloatOffset, applyPositionOffset } from '@config/carousel.config';

export function useCardFloat(groupRef, basePosition, index) {
    const floatSpeed = useRef(
        Math.random() * (CAROUSEL_CONFIG.FLOAT.SPEED_MAX - CAROUSEL_CONFIG.FLOAT.SPEED_MIN) +
        CAROUSEL_CONFIG.FLOAT.SPEED_MIN
    );

    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        const offset = calculateFloatOffset(
            clock.getElapsedTime(),
            index,
            floatSpeed.current
        );

        const newPosition = applyPositionOffset(basePosition, offset);

        groupRef.current.position.x = newPosition[0];
        groupRef.current.position.y = newPosition[1];
        groupRef.current.position.z = newPosition[2];
    });
}
