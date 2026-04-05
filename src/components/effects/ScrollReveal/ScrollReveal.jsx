import { REVEAL } from '@config/animation.config';
import { motion, useInView } from 'framer-motion';
import { useMemo, useRef } from 'react';

import styles from './ScrollReveal.module.css';

export default function ScrollReveal({ children }) {
    const ref = useRef(null);

    const observerOptions = useMemo(
        () => ({
            rootMargin: '0px 0px -20% 0px',
            threshold: 0.1,
            root: typeof globalThis !== 'undefined' && globalThis.lenis ? null : undefined,
        }),
        []
    );

    const inView = useInView(ref, observerOptions);

    return (
        <motion.div
            ref={ref}
            className={styles.scrollReveal}
            initial={{ opacity: 0.1, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.1, y: 8 }}
            transition={{ duration: REVEAL.DURATION, ease: 'easeOut' }}
        >
            <p className={styles.scrollRevealText}>{children}</p>
        </motion.div>
    );
}
