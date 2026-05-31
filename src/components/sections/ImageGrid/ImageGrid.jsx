import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './ImageGrid.module.css';

const introVars = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: REVEAL.MEDIUM_DURATION, ease: EASING.EMPHASIZED },
    },
};

const gridVars = {
    hidden: {},
    visible: {
        transition: { staggerChildren: STAGGER.FAST, delayChildren: 0.1 },
    },
};

const cellVars = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: REVEAL.MEDIUM_DURATION, ease: EASING.EMPHASIZED },
    },
};

export default function ImageGrid({ images, columns = 4, label, heading }) {
    return (
        <section className={styles.wrapper}>
            {(label || heading) && (
                <motion.div
                    className={styles.intro}
                    variants={introVars}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                >
                    {label && <label className={styles.label}>{label}</label>}
                    {heading && <h3>{heading}</h3>}
                </motion.div>
            )}
            <motion.div
                className={styles.grid}
                style={{ '--columns': columns }}
                variants={gridVars}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {images.map((image) => (
                    <motion.figure key={image.src} className={styles.cell} variants={cellVars}>
                        <img src={image.src} alt={image.alt} />
                        {image.label && <figcaption>{image.label}</figcaption>}
                    </motion.figure>
                ))}
            </motion.div>
        </section>
    );
}
