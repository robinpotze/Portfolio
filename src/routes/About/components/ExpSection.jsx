import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'framer-motion';
import styles from '../About.module.css';
import AboutItem from './AboutItem';

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

export default function ExpSection({ data }) {
    return (
        <>
            {data.map((entry) => (
                <div className={styles.subsection} key={entry.name + entry.date}>
                    <motion.div className={styles.subsectionHeader} variants={headerVariants}>
                        <span className={styles.subsectionName}>{entry.name}</span>
                        <span className={styles.subsectionFunction}>{entry.function}</span>
                        <span className={styles.subsectionDate}>{entry.date}</span>
                    </motion.div>
                    <ul className={styles.list}>
                        {entry.details.map((item) => (
                            <AboutItem key={item.text} text={item.text} icon={item.icon} />
                        ))}
                    </ul>
                </div>
            ))}
        </>
    );
}
