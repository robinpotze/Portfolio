import PlsIcon from '@/assets/icons/PLS.svg?react';
import ScrollReveal from '@components/ui/ScrollReveal';
import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './WorkHeader.module.css';

export default function WorkHeader({ title, subtitle, description }) {
    return (
        <div className={styles.wrapper}>
            <motion.div
                className={styles.bar}
                style={{ originX: 0 }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: REVEAL.MEDIUM_DURATION, ease: EASING.EMPHASIZED }}
            >
                <div className={styles.barContent}>
                    <h3>{title}</h3>
                    <PlsIcon aria-hidden="true" />
                    <p className="deco-small">{subtitle}</p>
                </div>
            </motion.div>
            <div className={styles.description}>
                <ScrollReveal>{description}</ScrollReveal>
            </div>
        </div>
    );
}
