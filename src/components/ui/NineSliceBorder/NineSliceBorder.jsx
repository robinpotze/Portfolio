import { motion, useTransform } from 'motion/react';
import styles from './NineSliceBorder.module.css';

/**
 * A single viewport-level nine-slice border overlay.
 *
 * Uses CSS border-image to natively nine-slice MRKR.svg.
 * Position/size driven by motion spring MotionValues
 * for smooth physics-based animation.
 */
export default function NineSliceBorder({ x, y, w, h }) {
    // Derive left/top from center x,y and width,height
    const left = useTransform(() => x.get() - w.get() / 2);
    const top = useTransform(() => y.get() - h.get() / 2);

    return (
        <motion.div
            className={styles.nineSliceBorder}
            style={{
                width: w,
                height: h,
                left,
                top,
            }}
        />
    );
}
