import ScrollReveal from '@components/ui/ScrollReveal';
import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './WorkSubHeader.module.css';

export default function WorkSubHeader({ label, title, description }) {
    return (
        <motion.div
            className={styles.wrapper}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: REVEAL.MEDIUM_DURATION, ease: EASING.EMPHASIZED }}
        >
            <div className={styles.section}>
                <span className={styles.label}>{label}</span>
                <h4 className={styles.title}>{title}</h4>
            </div>
            {description && <ScrollReveal>{description}</ScrollReveal>}
        </motion.div>
    );
}
