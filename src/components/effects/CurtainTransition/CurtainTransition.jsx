/* eslint-disable react/prop-types */

import { CURTAIN, EASING } from '@config/animation.config';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import styles from './CurtainTransition.module.css';

const LAYER_COLORS = ['var(--c-lght_100)', 'var(--c-brnd_100)', 'var(--c-drk_100)'];
const EASE = EASING.EMPHASIZED;
const DURATION = CURTAIN.DURATION_MS / 1000;
const STAGGER_DELAY = CURTAIN.LAYER_STAGGER_MS / 1000;

const DIRECTION_CONFIG = {
    up: {
        axis: 'y',
        initial: '100%',
        covered: '0%',
        revealed: '-100%',
    },
    down: {
        axis: 'y',
        initial: '-100%',
        covered: '0%',
        revealed: '100%',
    },
    left: {
        axis: 'x',
        initial: '100%',
        covered: '0%',
        revealed: '-100%',
    },
    right: {
        axis: 'x',
        initial: '-100%',
        covered: '0%',
        revealed: '100%',
    },
};

export default function CurtainTransition({ isOpen = false, direction = 'up', pageName, onCoverComplete, onRevealComplete }) {
    const config = DIRECTION_CONFIG[direction] || DIRECTION_CONFIG.up;
    const lastLayerRef = useRef(null);
    const prevIsOpenRef = useRef(isOpen);

    useEffect(() => {
        prevIsOpenRef.current = isOpen;
    }, [isOpen]);

    const handleAnimationComplete = () => {
        if (isOpen && onCoverComplete) {
            onCoverComplete();
            return;
        }
        if (onRevealComplete) {
            onRevealComplete();
        }
    };

    const getAnimateValue = () => {
        if (isOpen) return config.covered;
        if (prevIsOpenRef.current) return config.revealed;
        return config.initial;
    };

    return (
        <div className={styles.curtainTransition} data-active={isOpen || undefined}>
            {LAYER_COLORS.map((color, i) => {
                const isLastLayer = i === LAYER_COLORS.length - 1;

                return (
                    <motion.div
                        key={color}
                        ref={isLastLayer ? lastLayerRef : null}
                        className={styles.curtainLayer}
                        style={{
                            background: color,
                            zIndex: 5 + i,
                        }}
                        initial={{ [config.axis]: config.initial }}
                        animate={{ [config.axis]: getAnimateValue() }}
                        transition={{
                            duration: DURATION,
                            ease: EASE,
                            delay: i * STAGGER_DELAY,
                        }}
                        onAnimationComplete={isLastLayer ? handleAnimationComplete : undefined}
                    >
                        {isLastLayer && pageName && <span className={styles.curtainLabel}>{pageName}</span>}
                    </motion.div>
                );
            })}
        </div>
    );
}
