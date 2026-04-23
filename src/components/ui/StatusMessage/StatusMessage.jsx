import CrsDecal from '@/assets/decals/CRS.svg?react';
import PlsDecal from '@/assets/decals/PLS.svg?react';
import CrsIcon from '@/assets/icons/CRS.svg?react';
import GatIcon from '@/assets/icons/GAT.svg?react';
import MrkIcon from '@/assets/icons/MRK.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';
import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './StatusMessage.module.css';

const STATUS_CONFIG = {
    success: { Icon: GatIcon, Decal: PlsDecal },
    warning: { Icon: MrkIcon, Decal: PlsDecal },
    error: { Icon: CrsIcon, Decal: CrsDecal },
};

const panelVariants = {
    hidden: {
        opacity: 0,
        clipPath: 'inset(-32px -32px -32px 100%)',
    },
    visible: (delay = 0) => ({
        opacity: 1,
        clipPath: 'inset(-32px -32px -32px -32px)',
        transition: {
            delay,
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
            when: 'beforeChildren',
            delayChildren: REVEAL.DELAY,
            staggerChildren: STAGGER.FAST,
        },
    }),
    exit: {
        opacity: 0,
        clipPath: 'inset(-32px -32px -32px 100%)',
        transition: {
            duration: REVEAL.EXIT_DURATION,
            ease: EASING.EXIT,
            when: 'afterChildren',
            staggerChildren: STAGGER.FAST,
            staggerDirection: -1,
        },
    },
};

const fromLeftVariants = {
    hidden: { opacity: 0, x: -REVEAL.X_OFFSET * 2 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: REVEAL.QUICK_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
    exit: {
        opacity: 0,
        x: -REVEAL.X_OFFSET,
        transition: {
            duration: REVEAL.EXIT_DURATION,
            ease: EASING.EXIT,
        },
    },
};

const fromRightVariants = {
    hidden: { opacity: 0, x: REVEAL.X_OFFSET * 2 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: REVEAL.QUICK_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
    exit: {
        opacity: 0,
        x: REVEAL.X_OFFSET,
        transition: {
            duration: REVEAL.EXIT_DURATION,
            ease: EASING.EXIT,
        },
    },
};

export default function StatusMessage({ status = 'success', message, isVisible = true, delay = 0 }) {
    const { Icon, Decal } = STATUS_CONFIG[status] ?? STATUS_CONFIG.success;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`${styles.statusMessage} ${styles[status] ?? ''}`}
                    variants={panelVariants}
                    custom={delay}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div className={styles.cornerIconTR} variants={fromRightVariants}>
                        <PlsIcon aria-hidden="true" />
                    </motion.div>
                    <motion.div className={styles.iconWrapper} variants={fromLeftVariants}>
                        <Decal className={styles.decoIcon} aria-hidden="true" />
                        <Icon className={styles.statusIcon} aria-hidden="true" />
                    </motion.div>
                    <motion.span className={styles.message} variants={fromRightVariants}>
                        {message}
                    </motion.span>
                    <motion.div className={styles.cornerIconBL} variants={fromLeftVariants}>
                        <PlsIcon aria-hidden="true" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
