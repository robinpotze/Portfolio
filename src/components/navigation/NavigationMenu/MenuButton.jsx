import CrsIcon from '@/assets/icons/CRS.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';
import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './NavigationMenu.module.css';

export default function MenuButton({ open, label, toggle, glitchRefs, ref }) {
    return (
        <header className={styles.header}>
            <button ref={ref} className={styles.toggle} onClick={toggle} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
                <motion.span
                    className={styles.icon}
                    aria-hidden="true"
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{
                        duration: open ? REVEAL.DURATION : REVEAL.QUICK_DURATION,
                        ease: EASING.EMPHASIZED,
                    }}
                >
                    <motion.div
                        className={styles.iconImg}
                        animate={{ opacity: open ? 0 : 1, scale: open ? 0.6 : 1 }}
                        transition={{ duration: REVEAL.QUICK_DURATION }}
                    >
                        <PlsIcon />
                    </motion.div>
                    <motion.div
                        className={styles.iconImg}
                        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.6 }}
                        transition={{ duration: REVEAL.QUICK_DURATION }}
                    >
                        <CrsIcon />
                    </motion.div>
                </motion.span>

                <span className={styles.toggleTextWrap}>
                    <span className={styles.glitchStack}>
                        <span
                            ref={(el) => {
                                glitchRefs.current.main = el;
                            }}
                            className={styles.glitchLayerMain}
                        >
                            {label}
                        </span>
                        <span
                            ref={(el) => {
                                glitchRefs.current.red = el;
                            }}
                            className={styles.glitchLayerRed}
                            aria-hidden="true"
                        >
                            {label}
                        </span>
                        <span
                            ref={(el) => {
                                glitchRefs.current.blue = el;
                            }}
                            className={styles.glitchLayerBlue}
                            aria-hidden="true"
                        >
                            {label}
                        </span>
                    </span>
                </span>
            </button>
        </header>
    );
}
