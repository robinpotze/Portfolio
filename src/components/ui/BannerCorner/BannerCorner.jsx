import { motion } from 'motion/react';

import PlsIcon from '@/assets/icons/PLS.svg?react';
import { EASING, REVEAL, STAGGER } from '@config/animation.config';

import styles from './BannerCorner.module.css';

const POSITION_CONFIG = {
    tl: { wrapperClass: styles.wrapperTl, contentClass: styles.content, customY: STAGGER.DEFAULT * 200 },
    tr: { wrapperClass: styles.wrapperTr, contentClass: styles.content, customY: STAGGER.DEFAULT * 200 },
    bl: { wrapperClass: styles.wrapperBl, contentClass: styles.contentBl, customY: -STAGGER.DEFAULT * 200 },
    br: { wrapperClass: styles.wrapperBr, contentClass: styles.contentBr, customY: -STAGGER.DEFAULT * 200 },
};

const cornerVariants = {
    hidden: (direction) => ({
        opacity: 0,
        y: direction.y,
    }),
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: REVEAL.QUICK_DURATION,
            delay: REVEAL.LONG_DURATION + STAGGER.PAGE,
            ease: EASING.EMPHASIZED,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: REVEAL.EXIT_DURATION,
            ease: EASING.EXIT,
        },
    },
};

export default function BannerCorner({ position = 'tl', icon: Icon = PlsIcon, children, className }) {
    const { wrapperClass, contentClass, customY } = POSITION_CONFIG[position];

    return (
        <motion.div
            className={`${wrapperClass} ${className ?? ''}`}
            custom={{ y: customY }}
            variants={cornerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className={styles.corner}>
                <Icon className={styles.icon} aria-hidden="true" />
            </div>
            {children && <div className={contentClass}>{children}</div>}
        </motion.div>
    );
}
