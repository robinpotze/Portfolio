import { CARD_HEIGHT, CARD_WIDTH } from '@canvas/work/WorkCard';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { calculateCardPosition, calculateCardScale } from '@utils/carousel';
import { useCallback, useRef } from 'react';
import * as THREE from 'three';

// Reusable vectors to avoid allocation per frame
const _cardLocal = new THREE.Vector3();
const _cardWorld = new THREE.Vector3();
const _cornerA = new THREE.Vector3();
const _cornerB = new THREE.Vector3();

export default function useBorderProjection(containerRef, cameraRef, rigRef, { rawX, rawY, rawW, rawH }) {
    const initializedRef = useRef(false);

    const handleCenterednessChange = useCallback(
        (centeredness, bestIndex) => {
            const container = containerRef.current;
            const camera = cameraRef.current;
            const rig = rigRef.current;
            if (!container || !camera || !rig) {
                return;
            }

            const rect = container.getBoundingClientRect();

            // Ensure matrices reflect the rig rotation and camera position set this frame
            rig.updateWorldMatrix(true, false);
            camera.updateMatrixWorld();

            const localPos = calculateCardPosition(bestIndex);
            const angle = bestIndex * CAROUSEL_CONFIG.ANGLE_STEP;
            const cardScale = calculateCardScale(centeredness);
            const halfW = CARD_WIDTH * 0.5 * cardScale;
            const halfH = CARD_HEIGHT * 0.5 * cardScale;

            // Project card center — localToWorld already includes parent SCALE_FACTOR
            _cardLocal.set(localPos[0], localPos[1], localPos[2]);
            rig.localToWorld(_cardWorld.copy(_cardLocal));

            const projected = _cardWorld.clone().project(camera);
            const screenX = (projected.x * 0.5 + 0.5) * rect.width + rect.left;
            const screenY = (-projected.y * 0.5 + 0.5) * rect.height + rect.top;

            // Project corners accounting for card's Y-rotation on the carousel
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            _cornerA.set(localPos[0] - cosA * halfW, localPos[1] - halfH, localPos[2] + sinA * halfW);
            rig.localToWorld(_cornerA);
            _cornerA.project(camera);

            _cornerB.set(localPos[0] + cosA * halfW, localPos[1] + halfH, localPos[2] - sinA * halfW);
            rig.localToWorld(_cornerB);
            _cornerB.project(camera);

            const cardScreenW = Math.abs(_cornerB.x - _cornerA.x) * 0.5 * rect.width;
            const cardScreenH = Math.abs(_cornerB.y - _cornerA.y) * 0.5 * rect.height;

            const t = centeredness;
            const vw = globalThis.innerWidth;
            const vh = globalThis.innerHeight;
            const overshoot = 1.5;

            const targetX = screenX + t * (vw / 2 - screenX);
            const targetY = screenY + t * (vh / 2 - screenY);
            const targetW = 100 + cardScreenW + t * (vw * overshoot - cardScreenW);
            const targetH = 100 + cardScreenH + t * (vh * overshoot - cardScreenH);

            if (!initializedRef.current) {
                initializedRef.current = true;
                rawX.jump(targetX);
                rawY.jump(targetY);
                rawW.jump(targetW);
                rawH.jump(targetH);
            } else {
                rawX.set(targetX);
                rawY.set(targetY);
                rawW.set(targetW);
                rawH.set(targetH);
            }
        },
        [containerRef, cameraRef, rigRef, rawX, rawY, rawW, rawH]
    );

    return handleCenterednessChange;
}
