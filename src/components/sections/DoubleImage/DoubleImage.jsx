import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './DoubleImage.module.css';

const containerVars = {
    hidden: {},
    visible: {
        transition: { staggerChildren: STAGGER.DEFAULT },
    },
};

const imgVarsL = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: REVEAL.DURATION, ease: EASING.EMPHASIZED },
    },
};

const imgVarsR = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: REVEAL.DURATION, ease: EASING.EMPHASIZED },
    },
};

export default function DoubleImage({ images }) {
    return (
        <motion.div
            className={styles.wrapper}
            variants={containerVars}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
        >
            <motion.img src={images[0].src} alt={images[0].alt} loading="lazy" decoding="async" variants={imgVarsL} />
            <motion.img src={images[1].src} alt={images[1].alt} loading="lazy" decoding="async" variants={imgVarsR} />
        </motion.div>
    );
}
