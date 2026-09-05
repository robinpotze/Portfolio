import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './FullImage.module.css';

export default function FullImage({ src, alt, thin = false, contain = false }) {
    return (
        <motion.div
            className={`${styles.wrapper} ${thin ? styles.thin : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: REVEAL.DURATION, ease: EASING.EMPHASIZED }}
        >
            <img src={src} alt={alt} className={contain ? styles.contain : undefined} loading="lazy" decoding="async" />
        </motion.div>
    );
}
