import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './ComparisonBlock.module.css';

const introVars = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: REVEAL.MEDIUM_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

const gridVars = {
    hidden: {},
    visible: {
        transition: { staggerChildren: STAGGER.DEFAULT },
    },
};

const figureVars = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: REVEAL.DURATION, ease: EASING.EMPHASIZED },
    },
};

export default function ComparisonBlock({ label, heading, items }) {
    return (
        <section className={styles.wrapper}>
            <motion.div className={styles.intro} variants={introVars} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
                {label && <label className={styles.label}>{label}</label>}
                {heading && <h3>{heading}</h3>}
            </motion.div>
            <motion.div className={styles.grid} variants={gridVars} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                {items.map((item) => (
                    <motion.figure key={item.caption} variants={figureVars}>
                        <figcaption>{item.caption}</figcaption>
                        <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                    </motion.figure>
                ))}
            </motion.div>
        </section>
    );
}
