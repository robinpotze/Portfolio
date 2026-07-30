import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './CaseIntro.module.css';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg'];

const overlayVars = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: STAGGER.DEFAULT,
            delayChildren: 0.1,
        },
    },
};

const kickerVars = {
    hidden: { opacity: 0, x: -14 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: REVEAL.QUICK_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

const headingVars = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: REVEAL.DURATION, ease: EASING.EMPHASIZED },
    },
};

const subtitleVars = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: REVEAL.MEDIUM_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

export default function CaseIntro({ src, kicker, heading, subtitle }) {
    const isVideo = VIDEO_EXTENSIONS.some((ext) => src?.toLowerCase().endsWith(ext));

    return (
        <section className={styles.wrapper}>
            {isVideo ? <video src={src} autoPlay loop muted playsInline /> : <img src={src} alt="" />}
            <motion.div
                className={styles.overlay}
                variants={overlayVars}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
            >
                {kicker && (
                    <motion.label className={styles.kicker} variants={kickerVars}>
                        {kicker}
                    </motion.label>
                )}
                <motion.h1 variants={headingVars}>{heading}</motion.h1>
                {subtitle && <motion.p variants={subtitleVars}>{subtitle}</motion.p>}
            </motion.div>
        </section>
    );
}
