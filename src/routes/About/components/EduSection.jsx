import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'framer-motion';
import styles from '../About.module.css';

const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

export default function EduSection({ data }) {
    return (
        <>
            {data.map((entry) => (
                <div className={styles.subsection} key={entry.school + entry.date}>
                    <motion.div className={styles.subsectionHeader} variants={headerVariants}>
                        <span className={styles.subsectionName}>{entry.school}</span>
                    </motion.div>
                    <motion.div className={styles.subsectionDetails} variants={headerVariants}>
                        <span className={styles.subsectionCourse}>{entry.course}</span>
                        <span className={styles.subsectionDate}>{entry.date}</span>
                    </motion.div>
                </div>
            ))}
        </>
    );
}
