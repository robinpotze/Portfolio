import { ANIMATION_EASING, ANIMATION_TIMING } from '@config/animations';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import styles from './CurtainTransition.module.css';

const LAYER_COLORS = ['var(--c-LGHT)', 'var(--c-BRND)', 'var(--c-DRK)'];
const EASE = ANIMATION_EASING.CURTAIN;
const DURATION = ANIMATION_TIMING.CURTAIN_DURATION / 1000; // Convert to seconds
const STAGGER_DELAY = ANIMATION_TIMING.LAYER_STAGGER_DELAY / 1000; // Convert to seconds

const DIRECTION_CONFIG = {
    up: {
        axis: 'y',
        initial: '100%',
        covered: '0%',
        revealed: '-100%'
    },
    down: {
        axis: 'y',
        initial: '-100%',
        covered: '0%',
        revealed: '100%'
    },
    left: {
        axis: 'x',
        initial: '100%',
        covered: '0%',
        revealed: '-100%'
    },
    right: {
        axis: 'x',
        initial: '-100%',
        covered: '0%',
        revealed: '100%'
    }
};

export default function CurtainTransition({
    isOpen = false,
    direction = 'up',
    onCoverComplete,
    onRevealComplete
}) {
    const config = DIRECTION_CONFIG[direction] || DIRECTION_CONFIG.up;
    const lastLayerRef = useRef(null);
    const prevIsOpenRef = useRef(isOpen);

    useEffect(() => {
        prevIsOpenRef.current = isOpen;
    }, [isOpen]);

    const handleAnimationComplete = () => {
        if (isOpen && onCoverComplete) {
            onCoverComplete();
        } else if (!isOpen && onRevealComplete) {
            onRevealComplete();
        }
    };

    const getAnimateValue = () => {
        if (isOpen) {
            return config.covered;
        } else {
            return prevIsOpenRef.current ? config.revealed : config.initial;
        }
    };

    return (
        <div className={styles.curtainTransition} data-active={isOpen || undefined}>
            {LAYER_COLORS.map((color, i) => {
                const isLastLayer = i === LAYER_COLORS.length - 1;

                return (
                    <motion.div
                        key={i}
                        ref={isLastLayer ? lastLayerRef : null}
                        className={styles.curtainLayer}
                        style={{
                            background: color,
                            zIndex: 5 + i
                        }}
                        initial={{ [config.axis]: config.initial }}
                        animate={{ [config.axis]: getAnimateValue() }}
                        transition={{
                            duration: DURATION,
                            ease: EASE,
                            delay: i * STAGGER_DELAY
                        }}
                        onAnimationComplete={isLastLayer ? handleAnimationComplete : undefined}
                    />
                );
            })}
        </div>
    );
}
