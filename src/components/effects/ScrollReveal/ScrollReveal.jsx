import { motion, useInView } from 'framer-motion';
import PropTypes from 'prop-types';
import { useMemo, useRef } from 'react';

import styles from './ScrollReveal.module.css';

const ScrollReveal = ({ children }) => {
    const ref = useRef(null);

    const observerOptions = useMemo(() => ({
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.1,
        root: typeof globalThis !== 'undefined' && globalThis.lenis ? null : undefined
    }), []);

    const inView = useInView(ref, observerOptions);

    return (
        <motion.div
            ref={ref}
            className={styles.scrollReveal}
            initial={{ opacity: 0.1, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.1, y: 8 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <p className={styles.scrollRevealText}>
                {children}
            </p>
        </motion.div>
    );
};

ScrollReveal.propTypes = {
    children: PropTypes.node.isRequired
};

export default ScrollReveal;
