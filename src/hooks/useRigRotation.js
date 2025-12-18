import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { CAROUSEL_CONFIG, calculateRigRotation, calculateCameraY } from '@config/carousel.config';

export function useRigRotation(rigRef, itemCount) {
    const cameraRef = useRef();
    const scroll = useScroll();

    useThree(({ camera }) => {
        cameraRef.current = camera;
    });

    useFrame(() => {
        if (!rigRef.current) return;

        const targetRotation = calculateRigRotation(scroll.offset, itemCount);
        rigRef.current.rotation.y +=
            (targetRotation - rigRef.current.rotation.y) * CAROUSEL_CONFIG.LERP_SPEED;

        if (cameraRef.current) {
            const targetY = calculateCameraY(scroll.offset, itemCount);
            cameraRef.current.position.y +=
                (targetY - cameraRef.current.position.y) * CAROUSEL_CONFIG.LERP_SPEED;
        }
    });
}
