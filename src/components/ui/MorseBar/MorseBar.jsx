import MorseIcon from '@/assets/decals/MORSE.svg?react';
import styles from './MorseBar.module.css';

// Horizontal crop of the vertical MORSE decal: first 132 units, laid out 110×24
export default function MorseBar() {
    return (
        <span className={styles.bar} aria-hidden="true">
            <MorseIcon className={styles.svg} viewBox="0 0 30 132" width="24" height="110" preserveAspectRatio="none" />
        </span>
    );
}
