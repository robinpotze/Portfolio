import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import styles from './GlitchOverlay.module.css';

const FILTER_ID = 'glitchDisplace';

const stepEnd = (t) => (t >= 1 ? 1 : 0);

// ─── Overlay shell — just orchestrates children, no visual of its own ─────────

const overlayVariants = {
    hidden: {},
    visible: {},
    exit: { transition: { when: 'afterChildren' } },
};

// ─── Text container — stagger enter top→bottom, exit bottom→top ───────────────

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
    exit: { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
};

// Row flicker in: 0→flash→0→hold  |  Row flicker out: 1→flash→1→gone (mirror)
const rowVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: [0, 0, 1, 1, 0, 0, 1, 1],
        transition: {
            duration: 0.35,
            times: [0, 0.05, 0.06, 0.09, 0.1, 0.13, 0.14, 1],
            ease: 'linear',
        },
    },
    exit: {
        opacity: [1, 1, 0, 0, 1, 1, 0, 0],
        transition: {
            duration: 0.35,
            times: [0, 0.05, 0.06, 0.09, 0.1, 0.13, 0.14, 1],
            ease: 'linear',
        },
    },
};

// ─── Background layers ────────────────────────────────────────────────────────

const ditherTransition = {
    duration: 2.4,
    times: [0, 0.76, 0.79, 0.8, 0.87, 0.91, 1],
    repeat: Infinity,
    ease: 'linear',
};

const plusGridTransition = {
    duration: 1.2,
    times: [0, 0.07, 0.08, 0.09, 0.1, 0.12, 0.13, 1],
    ease: 'linear',
};

// ─── Glitch channels + flash ──────────────────────────────────────────────────

const GLITCH_TIMES = [0, 0.04, 0.07, 0.1, 0.13, 0.16, 0.22, 0.35, 0.38, 0.55, 0.62, 0.72, 0.78, 1];
const GLITCH_EASE = Array(GLITCH_TIMES.length - 1).fill(stepEnd);
const glitchTransition = { duration: 0.4, times: GLITCH_TIMES, ease: GLITCH_EASE };

const CYAN_CLIP = [
    'inset(0)',
    'inset(8% 0 85% 0)',
    'inset(65% 0 20% 0)',
    'inset(40% 0 45% 0)',
    'inset(0)',
    'inset(15% 0 70% 0)',
    'inset(0)',
    'inset(0)',
    'inset(30% 0 50% 0)',
    'inset(25% 0 55% 0)',
    'inset(0)',
    'inset(5% 0 80% 0)',
    'inset(0)',
    'inset(0)',
];

const RED_CLIP = [
    'inset(0)',
    'inset(75% 0 10% 0)',
    'inset(0)',
    'inset(10% 0 75% 0)',
    'inset(50% 0 30% 0)',
    'inset(80% 0 5% 0)',
    'inset(0)',
    'inset(0)',
    'inset(60% 0 20% 0)',
    'inset(55% 0 25% 0)',
    'inset(0)',
    'inset(70% 0 15% 0)',
    'inset(0)',
    'inset(0)',
];

export default function GlitchOverlay({ active, warningText = 'INTERCEPT' }) {
    const filterAnimRef = useRef(null);

    useEffect(() => {
        if (active) {
            filterAnimRef.current?.beginElement();
        }
    }, [active]);

    return (
        <>
            <svg className={styles.svgFilters} aria-hidden="true">
                <defs>
                    <filter id={FILTER_ID}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.15" numOctaves="1" seed="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G">
                            <animate
                                ref={filterAnimRef}
                                attributeName="scale"
                                values="0;70;0;55;0;85;0;0;45;40;0;75;0;0"
                                keyTimes="0;0.04;0.07;0.10;0.13;0.16;0.22;0.35;0.38;0.55;0.62;0.72;0.78;1"
                                dur="1.2s"
                                begin="indefinite"
                                fill="freeze"
                            />
                        </feDisplacementMap>
                    </filter>
                </defs>
            </svg>

            <AnimatePresence>
                {active && (
                    <motion.div
                        key="glitch-overlay"
                        className={styles.overlay}
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="alert"
                        aria-label={warningText}
                    >
                        {/* Dither — infinite opacity noise loop */}
                        <motion.div className={styles.dither} animate={{ opacity: [1, 1, 0.35, 1, 1, 0.55, 1] }} transition={ditherTransition} />

                        {/* Plus grid — blink in then hold */}
                        <motion.div
                            className={styles.plusGrid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0, 0.22, 0.22, 0, 0, 0.18, 0.18] }}
                            transition={plusGridTransition}
                        />

                        <div className={styles.vignette} />

                        {/* Text — inherits variant state from overlay shell */}
                        <motion.div className={styles.textContainer} variants={containerVariants} aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                                <motion.div key={i} className={styles.textRow} variants={rowVariants}>
                                    <span className={styles.word}>{warningText}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Cyan channel */}
                        <motion.div
                            className={styles.channelCyan}
                            initial={{ opacity: 0, clipPath: 'inset(0)' }}
                            animate={{
                                opacity: [0, 0.6, 0, 0.5, 0, 0.7, 0, 0, 0.4, 0.35, 0, 0.6, 0, 0],
                                clipPath: CYAN_CLIP,
                            }}
                            transition={glitchTransition}
                        />

                        {/* Red channel */}
                        <motion.div
                            className={styles.channelRed}
                            initial={{ opacity: 0, clipPath: 'inset(0)' }}
                            animate={{
                                opacity: [0, 0.5, 0, 0.6, 0.4, 0.6, 0, 0, 0.5, 0.3, 0, 0.5, 0, 0],
                                clipPath: RED_CLIP,
                            }}
                            transition={glitchTransition}
                        />

                        {/* White flash */}
                        <motion.div
                            className={styles.flash}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, 0.15, 0, 0.08, 0, 0.2, 0, 0, 0, 0, 0, 0.12, 0, 0],
                            }}
                            transition={glitchTransition}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export { FILTER_ID };
