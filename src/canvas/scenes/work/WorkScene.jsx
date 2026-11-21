import { useQuality } from '@app/QualityContext';
import {
    CAROUSEL_CONFIG,
    branchGrow,
    calculateCardCenteredness,
    calculateCardPresence,
    calculateCardPosition,
    calculateCardScale,
    getCarouselFov,
    WorkCard,
} from '@canvas/features/carousel';
import { CARD_HEIGHT, CARD_WIDTH } from '@canvas/features/carousel/cardGeometry';
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import { StreamFibers } from '@canvas/features/streamFibers';
import { STREAM } from '@config/animation.config';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { easeCurve } from '@utils/easingFunctions';

const { degToRad } = THREE.MathUtils;
// The trunk spans a bit more than the visible height, so its ends stay off-screen.
const TRUNK_OVERSCAN = 1.3;

export default function WorkScene({ items = [], segmentsRef, streamRef, onCardNavigate, onCenterednessChange, rigRef: externalRigRef, isMobile }) {
    const rigRef = useRef();
    const centerednessRef = useRef([]);
    const presenceRef = useRef([]);
    const bestIndexRef = useRef(0);
    const [visibleCenter, setVisibleCenter] = useState(0);
    const camera = useThree((state) => state.camera);
    const { quality } = useQuality();

    const scale = isMobile ? CAROUSEL_CONFIG.MOBILE.SCALE_FACTOR : CAROUSEL_CONFIG.SCALE_FACTOR;
    // One shared noise texture for every card (same inputs, so one CPU build instead of one per card).
    const noiseTexture = useNoiseTexture({ size: quality === 'low' ? 64 : 256, scale: 10, octaves: quality === 'low' ? 2 : 3, persistence: 0.5 });

    const setRigRef = (node) => {
        rigRef.current = node;
        if (externalRigRef) {
            externalRigRef.current = node;
        }
    };

    // Priority -1: runs before LogoParticles reads streamRef this frame.
    useFrame((_, delta) => {
        const rig = rigRef.current;
        if (!rig || items.length === 0) {
            return;
        }
        const { carousel: offset, morph, velocity } = segmentsRef.current;
        // Off-screen on Home; hidden rather than unmounted so card textures stay loaded for the first morph.
        rig.visible = morph > 0;

        const targetRotation = -offset * (items.length - 1) * CAROUSEL_CONFIG.ANGLE_STEP;
        rig.rotation.y += (targetRotation - rig.rotation.y) * CAROUSEL_CONFIG.LERP_SPEED;

        // HomeScene owns the camera until the morph completes; from then on it follows the descending spiral.
        if (morph >= 1) {
            camera.position.set(0, offset * (items.length - 1) * CAROUSEL_CONFIG.VERTICAL_STEP * scale, CAROUSEL_CONFIG.CAMERA.POSITION[2]);
            camera.lookAt(0, camera.position.y, 0);
            const fov = getCarouselFov();
            if (camera.fov !== fov) {
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }
        }

        let minCenteredness = 1;
        let bestIndex = 0;
        for (let i = 0; i < items.length; i++) {
            const c = calculateCardCenteredness(rig.rotation.y, i);
            centerednessRef.current[i] = c;
            if (c < minCenteredness) {
                minCenteredness = c;
                bestIndex = i;
            }
        }
        if (bestIndex !== bestIndexRef.current) {
            bestIndexRef.current = bestIndex;
            setVisibleCenter(bestIndex);
        }

        // Trunk in rig space: rig y = world y / scale (the rig only rotates about y).
        const stream = streamRef.current;
        stream.space = rig;
        stream.trunkY = camera.position.y / scale;
        stream.trunkHalf = (CAROUSEL_CONFIG.CAMERA.POSITION[2] * Math.tan(degToRad(getCarouselFov()) / 2) * TRUNK_OVERSCAN) / scale;
        stream.velocity = velocity;
        // Branches for the (at most two) cards on screen: the most and second-most present. Each slot holds the
        // card's centre and half-extents at its on-screen scale (rig space).
        let first = 0;
        let second = -1;
        for (let i = 0; i < items.length; i++) {
            presenceRef.current[i] = calculateCardPresence(centerednessRef.current[i], morph);
            if (presenceRef.current[i] > presenceRef.current[first]) {
                second = first;
                first = i;
            } else if (i !== first && (second < 0 || presenceRef.current[i] > presenceRef.current[second])) {
                second = i;
            }
        }
        [first, second].forEach((index, slot) => {
            const card = stream.cards[slot];
            if (index < 0) {
                card.grow = 0;
                return;
            }
            const [x, y, z] = calculateCardPosition(index);
            const angle = index * CAROUSEL_CONFIG.ANGLE_STEP;
            const cardScale = calculateCardScale(centerednessRef.current[index]);
            card.center.set(x, y, z);
            card.right.set(Math.cos(angle), 0, -Math.sin(angle)).multiplyScalar((CARD_WIDTH / 2) * cardScale);
            card.up.set(0, (CARD_HEIGHT / 2) * cardScale, 0);
            card.grow = branchGrow(presenceRef.current[index]);
        });
        // Flow: one shared phase for the sim and the fibres. velocity is viewport heights per frame.
        const scrollSpeed = delta > 0 ? Math.abs(velocity) / delta : 0;
        stream.flowStep = delta * (STREAM.FLOW_BASE + scrollSpeed * STREAM.FLOW_SCROLL_GAIN);
        stream.flow = (stream.flow + stream.flowStep) % 1;
        // Logo → stream progress, the same eased value HomeScene feeds the particle sim as timeline.stream.
        stream.blend = easeCurve(morph);

        // The frame fades in from morph 0.8; before that it is invisible.
        if (morph >= 0.8) {
            onCenterednessChange?.(minCenteredness, bestIndex);
        }
    }, -1);

    if (!items?.length) {
        return null;
    }

    return (
        <>
            <group scale={scale}>
                <group ref={setRigRef}>
                    {items.map((item, i) => (
                        <WorkCard
                            key={item.key}
                            item={item}
                            index={i}
                            visible={Math.abs(i - visibleCenter) <= 1}
                            segmentsRef={segmentsRef}
                            onNavigate={onCardNavigate}
                            noiseTexture={noiseTexture}
                            centerednessRef={centerednessRef}
                        />
                    ))}
                    <StreamFibers streamRef={streamRef} />
                </group>
            </group>
            <ambientLight intensity={1} />
        </>
    );
}
