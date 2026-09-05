import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './FeatureSplit.module.css';

export default function FeatureSplit({ src, alt, reverse = false, label, children }) {
    return (
        <section className={`${styles.wrapper} ${reverse ? styles.reverse : ''}`}>
            <motion.div
                className={styles.media}
                initial={{ opacity: 0, scale: 1.04 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                    duration: REVEAL.DURATION,
                    ease: EASING.EMPHASIZED,
                }}
            >
                <img src={src} alt={alt} />
            </motion.div>
            <motion.div
                className={styles.body}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                    duration: REVEAL.MEDIUM_DURATION,
                    delay: 0.18,
                    ease: EASING.EMPHASIZED,
                }}
            >
                {label && <label className={styles.label}>{label}</label>}
                {children}
            </motion.div>
        </section>
    );
}
