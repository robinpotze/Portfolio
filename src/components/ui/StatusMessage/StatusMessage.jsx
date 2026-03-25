import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './StatusMessage.module.css';

const STATUS_CONFIG = {
    success: { icon: '/img/icon/GAT_DRK.svg', decal: '/img/decal/PLS_DRK.svg' },
    error: { icon: '/img/icon/CRS_DRK.svg', decal: '/img/decal/CRS_DRK.svg' },
};

const panelVariants = {
    hidden: {
        opacity: 0,
        clipPath: 'inset(0 0 0 100%)',
    },
    visible: {
        opacity: 1,
        clipPath: 'inset(0 0 0 0)',
        transition: {
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
            when: 'beforeChildren',
            delayChildren: REVEAL.DELAY,
            staggerChildren: STAGGER.FAST,
        },
    },
    exit: {
        opacity: 0,
        clipPath: 'inset(0 0 0 100%)',
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

export default function StatusMessage({ status = 'success', message, isVisible = true }) {
    const { icon, decal } = STATUS_CONFIG[status] ?? STATUS_CONFIG.success;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`${styles.statusMessage} ${styles[status] ?? ''}`}
                    variants={panelVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                >
                    <motion.img
                        className={styles.cornerIconTR}
                        src='/img/icon/PLS_BRND_-100.svg'
                        alt='status message corner icon'
                        variants={fromRightVariants}
                    />
                    <motion.div className={styles.iconWrapper} variants={fromLeftVariants}>
                        <img className={styles.decoIcon} src={decal} alt="" />
                        <img className={styles.statusIcon} src={icon} alt={`${status} icon`} />
                    </motion.div>
                    <motion.span className={styles.message} variants={fromRightVariants}>{message}</motion.span>
                    <motion.img
                        className={styles.cornerIconBL}
                        src='/img/icon/PLS_BRND_-100.svg'
                        alt='status message corner icon'
                        variants={fromLeftVariants}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}