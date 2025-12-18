import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { calculateCardCenteredness, calculateCardScale } from '@config/carousel.config';

export function useCardScale(groupRef, index) {
    const rigRef = useRef();

    useFrame(() => {
        if (!groupRef.current) return;

        if (!rigRef.current) {
            rigRef.current = groupRef.current.parent;
        }

        if (!rigRef.current) return;

        const centeredness = calculateCardCenteredness(
            rigRef.current.rotation.y,
            index
        );

        const scale = calculateCardScale(centeredness);
        groupRef.current.scale.setScalar(scale);
    });
}
