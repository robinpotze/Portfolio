import { useWorkItems } from '@app/WorkContext';
import CanvasRoot from '@canvas/core/CanvasRoot';
import { CAROUSEL_CONFIG, useBorderProjection } from '@canvas/features/carousel';
import HomeScene, { CAMERA_FOV, CAMERA_Z } from '@canvas/scenes/home/HomeScene';
import WorkScene from '@canvas/scenes/work/WorkScene';
import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';
import { PerspectiveCamera } from '@react-three/drei';
import { prefetchEntryPages } from '@routes/Entry/pages/autogen';
import { useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './HomeWorkCanvas.module.css';
import PostFX from './PostFX';

/** The shared canvas for / and /work: Home and the carousel in one scene, driven by the layout's segmentsRef. */
export default function HomeWorkCanvas({ segmentsRef, startAnimations }) {
    const items = useWorkItems();
    const { navigateWithTransition } = usePageTransition();
    const containerRef = useRef(null);
    const cameraRef = useRef(null);
    const rigRef = useRef(null);
    const hasNavigated = useRef(false);
    const streamRef = useRef({
        space: null,
        trunkY: 0,
        trunkHalf: 10,
        velocity: 0,
        // Branch slots by card index parity: 0 = even cards, 1 = odd cards.
        cards: [0, 1].map(() => ({ center: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), grow: 0 })),
        flow: 0,
        flowStep: 0,
        blend: 0,
        // Written by LogoParticles while its sim runs; the fibres grow out of these particles.
        simPosition: null,
        simRandom: null,
        localToStream: new THREE.Matrix4(),
    });
    const [isMobile] = useState(() => window.innerWidth <= CAROUSEL_CONFIG.MOBILE.BREAKPOINT);

    // Border frame around the centred card.
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawW = useMotionValue(0);
    const rawH = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG.BORDER_ANIMATION);
    const y = useSpring(rawY, SPRING_CONFIG.BORDER_ANIMATION);
    const w = useSpring(rawW, SPRING_CONFIG.BORDER_ANIMATION);
    const h = useSpring(rawH, SPRING_CONFIG.BORDER_ANIMATION);
    const springs = useMemo(() => ({ rawX, rawY, rawW, rawH, springX: x, springY: y, springW: w, springH: h }), [rawX, rawY, rawW, rawH, x, y, w, h]);
    const onCenterednessChange = useBorderProjection(containerRef, cameraRef, rigRef, springs);

    // Prefetch entry page bundles so a card click opens instantly.
    useEffect(() => {
        prefetchEntryPages();
    }, []);

    const onCardNavigate = useCallback(
        (pageKey) => {
            if (hasNavigated.current) {
                return;
            }
            hasNavigated.current = true;
            const item = items.find((i) => i.key === pageKey);
            navigateWithTransition(`/work/${pageKey}`, item?.data?.title || pageKey, 'up');
        },
        [items, navigateWithTransition]
    );

    return (
        <div ref={containerRef} className={styles.canvasContainer}>
            <CanvasRoot
                adaptiveQuality={startAnimations}
                performance={{ min: 0.5 }}
                eventSource={document.getElementById('root')}
                eventPrefix="client"
                gl={{ antialias: true }}
            >
                <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, CAMERA_Z[0]]} fov={CAMERA_FOV[0]} />
                <HomeScene segmentsRef={segmentsRef} streamRef={streamRef} startAnimations={startAnimations} />
                <WorkScene
                    items={items}
                    segmentsRef={segmentsRef}
                    streamRef={streamRef}
                    onCardNavigate={onCardNavigate}
                    onCenterednessChange={onCenterednessChange}
                    rigRef={rigRef}
                    isMobile={isMobile}
                />
                {startAnimations && <PostFX segmentsRef={segmentsRef} />}
            </CanvasRoot>
            <div className={styles.border}>
                <NineSliceBorder x={x} y={y} w={w} h={h} />
            </div>
        </div>
    );
}
