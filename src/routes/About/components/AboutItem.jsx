import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from '../About.module.css';

const itemVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

export default function AboutItem({ text, icon: Icon, meta }) {
    return (
        <motion.li className={styles.item} variants={itemVariants}>
            <div className={styles.itemIcon}>{typeof Icon === 'string' ? <img src={Icon} alt="" /> : <Icon aria-hidden="true" />}</div>
            <span className={styles.itemText}>{text}</span>
            {meta && <span className={styles.itemMeta}>{meta}</span>}
        </motion.li>
    );
}
