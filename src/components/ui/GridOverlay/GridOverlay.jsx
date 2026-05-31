import PlsIcon from '@/assets/icons/PLS.svg?react';
import { EASING, REVEAL, SPRING_CONFIG, STAGGER } from '@config/animation.config';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GridOverlay.module.css';

/* ── Motion variants ──────────────────────────────── */

const layerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.015,
            delayChildren: STAGGER.DEFAULT,
        },
    },
};

const cellVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

const crosshairVariants = (opacity) => ({
    hidden: { opacity: 0, scale: 0.6 },
    visible: {
        opacity,
        scale: 1,
        transition: {
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
});

/* ── Helpers ──────────────────────────────────────── */

function buildStripeCells(rows, cols, activeSet, stripeWidth, stripeOpacity, blurStrength) {
    const cells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const active = activeSet.has(`${r}-${c}`);
            cells.push(
                <motion.div
                    key={`cell-${r}-${c}`}
                    className={active ? styles.stripeCell : styles.emptyCell}
                    style={
                        active
                            ? {
                                  '--stripe-w': `${stripeWidth}%`,
                                  '--stripe-opacity': stripeOpacity,
                                  '--cell-blur': `${blurStrength}px`,
                              }
                            : undefined
                    }
                    variants={cellVariants}
                />
            );
        }
    }
    return cells;
}

function buildCrosshairs(rows, cols, activeSet, CrosshairIcon, crosshairSize, crosshairOpacity) {
    const variants = crosshairVariants(crosshairOpacity);
    const items = [];
    for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
            let touches = false;
            for (let dr = -2; dr <= 1 && !touches; dr++) {
                for (let dc = -2; dc <= 1 && !touches; dc++) {
                    if (activeSet.has(`${r + dr}-${c + dc}`)) {
                        touches = true;
                    }
                }
            }
            if (!touches) {
                continue;
            }

            items.push(
                <motion.div
                    key={`cross-${r}-${c}`}
                    className={styles.crosshair}
                    style={{
                        width: crosshairSize,
                        height: crosshairSize,
                        left: `${(c / cols) * 100}%`,
                        top: `${(r / rows) * 100}%`,
                        marginLeft: -crosshairSize / 2,
                        marginTop: -crosshairSize / 2,
                    }}
                    variants={variants}
                >
                    <CrosshairIcon aria-hidden="true" />
                </motion.div>
            );
        }
    }
    return items;
}

/**
 * GridOverlay — reusable decoration component.
 *
 * Renders two layers over its parent:
 *   1. A responsive grid of cells with random vertical stripe overlays.
 *   2. SVG "+" icons at intersection points near active cells,
 *      with a subtle mouse-driven parallax offset.
 *
 * @param {number}   [cellMinSize=80]    - Minimum cell dimension (px).
 * @param {number}   [cellMaxSize=160]   - Maximum cell dimension (px).
 * @param {number}   [cellAspectRatio=1.6] - Width/height ratio for cells (>1 = wider than tall).
 * @param {number}   [stripeChance=0.35] - Probability (0-1) that a cell gets stripes.
 * @param {number}   [stripeCount=20]    - Number of vertical stripes per cell.
 * @param {number}   [stripeOpacity=0.12]- Opacity of the stripe pattern.
 * @param {number}   [blurStrength=4]    - Backdrop blur strength (px) on stripe cells.
 * @param {React.ComponentType} [CrosshairIcon=PlsIcon] - SVG icon component for crosshairs.
 * @param {number}   [crosshairSize=12]  - Crosshair icon size (px).
 * @param {number}   [crosshairOpacity=0.35] - Crosshair icon opacity.
 * @param {number}   [parallaxStrength=12]   - Max parallax shift in px.
 * @param {string}   [className]         - Additional CSS class on the root element.
 * @param {object}   [style]             - Additional inline styles on the root element.
 */
export default function GridOverlay({
    cellMinSize = 80,
    cellMaxSize = 160,
    cellAspectRatio = 1.6,
    stripeChance = 0.35,
    stripeCount = 20,
    stripeOpacity = 0.12,
    blurStrength = 10,
    CrosshairIcon = PlsIcon,
    crosshairSize = 24,
    crosshairOpacity = 0.35,
    parallaxStrength = 12,
    className = '',
    style = {},
}) {
    const containerRef = useRef(null);
    const [grid, setGrid] = useState({ rows: 0, cols: 0 });

    // Mouse-driven parallax spring values
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const px = useSpring(rawX, SPRING_CONFIG.CURSOR_TRACKING);
    const py = useSpring(rawY, SPRING_CONFIG.CURSOR_TRACKING);

    const onMouseMove = useCallback(
        (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            rawX.set(((e.clientX - cx) / cx) * parallaxStrength);
            rawY.set(((e.clientY - cy) / cy) * parallaxStrength);
        },
        [rawX, rawY, parallaxStrength]
    );

    useEffect(() => {
        globalThis.addEventListener('mousemove', onMouseMove);
        return () => globalThis.removeEventListener('mousemove', onMouseMove);
    }, [onMouseMove]);

    // Derive rows/cols from container dimensions
    useEffect(() => {
        const el = containerRef.current;
        if (!el) {
            return;
        }

        const calculate = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width === 0 || height === 0) {
                return;
            }

            const avgSize = (cellMinSize + cellMaxSize) / 2;
            const cellW = avgSize * cellAspectRatio;
            const cellH = avgSize;
            const cols = Math.max(1, Math.round(width / cellW));
            const rows = Math.max(1, Math.round(height / cellH));
            setGrid((prev) => (prev.rows === rows && prev.cols === cols ? prev : { rows, cols }));
        };

        calculate();

        const observer = new ResizeObserver(calculate);
        observer.observe(el);
        return () => observer.disconnect();
    }, [cellMinSize, cellMaxSize, cellAspectRatio]);

    const { rows, cols } = grid;

    // Generate a stable set of active cells whenever the grid dimensions change
    const activeSet = useMemo(() => {
        const set = new Set();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() < stripeChance) {
                    set.add(`${r}-${c}`);
                }
            }
        }
        return set;
    }, [rows, cols, stripeChance]);

    if (rows === 0 || cols === 0) {
        return <div ref={containerRef} className={`${styles.container} ${className}`} style={style} />;
    }

    const stripeWidth = 100 / stripeCount;
    const stripeCells = buildStripeCells(rows, cols, activeSet, stripeWidth, stripeOpacity, blurStrength);
    const crosshairs = buildCrosshairs(rows, cols, activeSet, CrosshairIcon, crosshairSize, crosshairOpacity);

    return (
        <div ref={containerRef} className={`${styles.container} ${className}`} style={style}>
            <motion.div className={styles.parallaxWrapper} style={{ x: px, y: py }}>
                <motion.div
                    className={styles.stripeLayer}
                    style={{ '--cols': cols, '--rows': rows }}
                    variants={layerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {stripeCells}
                </motion.div>

                <motion.div className={styles.crosshairLayer} variants={layerVariants} initial="hidden" animate="visible">
                    {crosshairs}
                </motion.div>
            </motion.div>
        </div>
    );
}
