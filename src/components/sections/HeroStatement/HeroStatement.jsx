import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './HeroStatement.module.css';

export default function HeroStatement({ label, children }) {
    return (
        <motion.section
            className={styles.wrapper}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: REVEAL.DURATION, ease: EASING.EMPHASIZED }}
        >
            {label && <label className={styles.label}>{label}</label>}
            {children}
        </motion.section>
    );
}
