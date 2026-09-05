import { motion } from 'motion/react';

import { EASING, REVEAL } from '@config/animation.config';

import styles from './StatusPanel.module.css';

const VARIANT_CLASS = {
    default: styles.panel,
    success: styles.success,
    error: styles.error,
};

const panelVariants = {
    hidden: {
        scaleX: 0,
        opacity: 1,
    },
    visible: {
        scaleX: 1,
        opacity: 1,
        transition: {
            delay: REVEAL.MEDIUM_DURATION,
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
    exit: {
        opacity: 0,
        scaleY: 0,
        transition: {
            duration: REVEAL.MEDIUM_DURATION,
            ease: EASING.EXIT,
        },
    },
};

const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: REVEAL.DURATION,
            delay: REVEAL.LONG_DURATION,
        },
    },
};

export default function StatusPanel({ variant = 'default', children, className }) {
    const panelClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.default;

    return (
        <motion.div className={`${panelClass} ${className ?? ''}`} variants={panelVariants} initial="hidden" animate="visible" exit="exit">
            <motion.div className={styles.content} variants={contentVariants}>
                {children}
            </motion.div>
        </motion.div>
    );
}
