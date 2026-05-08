import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './NavigationMenu.module.css';

const BG_COLORS = ['var(--c-lght_100)', 'var(--c-brnd_100)'];

export default function MenuBackgroundLayers({ open }) {
    return (
        <div className={styles.prelayers} aria-hidden="true">
            {BG_COLORS.map((color, i) => (
                <motion.div
                    key={color}
                    className={styles.prelayer}
                    style={{ background: color }}
                    initial={{ x: '-100%' }}
                    animate={{ x: open ? '0%' : '-100%' }}
                    transition={{
                        duration: REVEAL.EXIT_DURATION,
                        ease: EASING.EMPHASIZED,
                        delay: i * STAGGER.MICRO,
                    }}
                />
            ))}
        </div>
    );
}
