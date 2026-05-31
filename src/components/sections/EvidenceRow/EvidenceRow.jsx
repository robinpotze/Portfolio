import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './EvidenceRow.module.css';

const containerVars = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: STAGGER.DEFAULT,
        },
    },
};

const itemVars = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: REVEAL.MEDIUM_DURATION, ease: EASING.EMPHASIZED },
    },
};

export default function EvidenceRow({ items }) {
    return (
        <motion.section
            className={styles.wrapper}
            variants={containerVars}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            {items.map((item) => (
                <motion.div key={item.label} className={styles.item} variants={itemVars}>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                </motion.div>
            ))}
        </motion.section>
    );
}
