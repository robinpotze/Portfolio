import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ANIMATION_EASING, ANIMATION_TIMING } from '@config/animation.config';
import styles from './GridOverlay.module.css';

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
 * @param {string}   [crosshairSrc='/img/icon/PLS.svg'] - Path to the crosshair icon.
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
    crosshairSrc = '/img/icon/PLS.svg',
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
    const px = useSpring(rawX, { stiffness: 120, damping: 20 });
    const py = useSpring(rawY, { stiffness: 120, damping: 20 });

    const handleMouseMove = useCallback(
        (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            rawX.set(((e.clientX - cx) / cx) * parallaxStrength);
            rawY.set(((e.clientY - cy) / cy) * parallaxStrength);
        },
        [rawX, rawY, parallaxStrength]
    );

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    // Derive rows/cols from container dimensions
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const calculate = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width === 0 || height === 0) return;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, cols, stripeChance]);

    if (rows === 0 || cols === 0) {
        return <div ref={containerRef} className={`${styles.container} ${className}`} style={style} />;
    }

    // Animation variants
    const layerVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.015,
                delayChildren: ANIMATION_TIMING.PROJECT_HERO_SIDE_DELAY,
            },
        },
    };

    const cellVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: ANIMATION_TIMING.PROJECT_HERO_DURATION,
                ease: ANIMATION_EASING.PROJECT_HERO,
            },
        },
    };

    const crosshairVars = {
        hidden: { opacity: 0, scale: 0.6 },
        visible: {
            opacity: crosshairOpacity,
            scale: 1,
            transition: {
                duration: ANIMATION_TIMING.PROJECT_HERO_DURATION,
                ease: ANIMATION_EASING.PROJECT_HERO,
            },
        },
    };

    // Build stripe cells
    const stripeCells = [];
    // Stripe width as a percentage: each stripe pair (black+white) = 100%/stripeCount
    const stripeWidth = 100 / stripeCount;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const active = activeSet.has(`${r}-${c}`);
            stripeCells.push(
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
                    variants={cellVars}
                />
            );
        }
    }

    // Build crosshair icons at corners that are within one cell of any striped cell
    const crosshairs = [];
    for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
            // Check all cells in a 2-ring around this corner point:
            // The corner (r,c) sits between cells (r-1,c-1), (r-1,c), (r,c-1), (r,c).
            // Expanding by one extra ring means checking r-2..r+1, c-2..c+1.
            let touches = false;
            for (let dr = -2; dr <= 1 && !touches; dr++) {
                for (let dc = -2; dc <= 1 && !touches; dc++) {
                    if (activeSet.has(`${r + dr}-${c + dc}`)) {
                        touches = true;
                    }
                }
            }
            if (!touches) continue;

            crosshairs.push(
                <motion.img
                    key={`cross-${r}-${c}`}
                    className={styles.crosshair}
                    src={crosshairSrc}
                    alt=""
                    style={{
                        width: crosshairSize,
                        height: crosshairSize,
                        left: `${(c / cols) * 100}%`,
                        top: `${(r / rows) * 100}%`,
                        marginLeft: -crosshairSize / 2,
                        marginTop: -crosshairSize / 2,
                    }}
                    variants={crosshairVars}
                    draggable={false}
                />
            );
        }
    }

    return (
        <div ref={containerRef} className={`${styles.container} ${className}`} style={style}>
            <motion.div
                className={styles.stripeLayer}
                style={{ '--cols': cols, '--rows': rows }}
                variants={layerVars}
                initial="hidden"
                animate="visible"
            >
                {stripeCells}
            </motion.div>

            <motion.div className={styles.crosshairLayer} style={{ x: px, y: py }} variants={layerVars} initial="hidden" animate="visible">
                {crosshairs}
            </motion.div>
        </div>
    );
}
