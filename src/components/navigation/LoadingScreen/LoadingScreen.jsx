import { LOADING_REVEAL, TIMEOUT } from '@config/animation.config';
import { useProgress } from '@react-three/drei';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './LoadingScreen.module.css';

const CYCLE_INTERVAL = 900;
const BLOCK_SIZE = 6;
const BLOCK_GAP = 2;

function BlockLogo({ logoSrc }) {
    const canvasRef = useRef(null);
    const blockDataRef = useRef(null);
    const animRef = useRef(null);
    const cycleStartRef = useRef(Date.now());
    const colorsRef = useRef(null);

    // Resolve CSS variables once on mount
    useEffect(() => {
        colorsRef.current = {
            base: getCSSColorRGBA('--c-drk_40'),
            pulse: getCSSColorRGBA('--c-brnd_100'),
        };
    }, []);

    // Load SVG and extract block positions
    useEffect(() => {
        if (!logoSrc) {
            return;
        }
        const img = new Image();
        img.onload = () => {
            const scale = 4;
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            const offscreen = document.createElement('canvas');
            offscreen.width = w;
            offscreen.height = h;
            const ctx = offscreen.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            const imageData = ctx.getImageData(0, 0, w, h);
            const step = BLOCK_SIZE + BLOCK_GAP;
            const blocks = [];

            for (let by = 0; by < h; by += step) {
                for (let bx = 0; bx < w; bx += step) {
                    const i = (by * w + bx) * 4;
                    if (imageData.data[i + 3] > 100) {
                        blocks.push({ x: bx, y: by });
                    }
                }
            }

            const cx = w / 2;
            const cy = h / 2;
            let maxDist = 0;
            blocks.forEach((b) => {
                const d = Math.hypot(b.x - cx, b.y - cy);
                if (d > maxDist) {
                    maxDist = d;
                }
            });

            blockDataRef.current = {
                blocks: blocks.map((b) => ({
                    ...b,
                    dist: Math.hypot(b.x - cx, b.y - cy) / (maxDist || 1),
                })),
                width: w,
                height: h,
            };

            if (canvasRef.current) {
                canvasRef.current.width = w;
                canvasRef.current.height = h;
            }
        };
        img.src = logoSrc;
    }, [logoSrc]);

    // Continuous animation loop
    useEffect(() => {
        let running = true;

        const render = () => {
            if (!running) {
                return;
            }

            const canvas = canvasRef.current;
            const data = blockDataRef.current;
            const colors = colorsRef.current;
            if (!canvas || !data || !colors) {
                animRef.current = requestAnimationFrame(render);
                return;
            }

            const ctx = canvas.getContext('2d');
            const { blocks, width, height } = data;
            ctx.clearRect(0, 0, width, height);

            const elapsed = (Date.now() - cycleStartRef.current) % CYCLE_INTERVAL;
            const t = elapsed / CYCLE_INTERVAL;

            blocks.forEach((block) => {
                // Scattered radial pulse from center
                const waveFront = t * 1.6;
                const distFromWave = block.dist - waveFront;
                const waveWidth = 0.45;
                const scatter = Math.random() < 0.12 ? Math.random() * 0.7 : 0;
                const waveIntensity = Math.max(0, 1 - Math.abs(distFromWave) / waveWidth);
                const intensity = Math.min(1, waveIntensity + scatter);

                const r = Math.round(colors.base.r + (colors.pulse.r - colors.base.r) * intensity);
                const g = Math.round(colors.base.g + (colors.pulse.g - colors.base.g) * intensity);
                const b = Math.round(colors.base.b + (colors.pulse.b - colors.base.b) * intensity);
                const a = colors.base.a + (colors.pulse.a - colors.base.a) * intensity;

                // Glitch: random block displacement
                let ox = 0,
                    oy = 0;
                if (Math.random() < 0.015) {
                    ox = Math.round((Math.random() - 0.5) * 14);
                    oy = Math.round((Math.random() - 0.5) * 6);
                }

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                ctx.fillRect(block.x + ox, block.y + oy, BLOCK_SIZE, BLOCK_SIZE);
            });

            // Occasional horizontal glitch scanline
            if (Math.random() < 0.08) {
                const lineY = Math.floor(Math.random() * height);
                const lineH = Math.floor(Math.random() * 3) + 1;
                const shiftX = Math.round((Math.random() - 0.5) * 24);
                if (lineY + lineH < height) {
                    const slice = ctx.getImageData(0, lineY, width, lineH);
                    ctx.putImageData(slice, shiftX, lineY);
                }
            }

            animRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            running = false;
            if (animRef.current) {
                cancelAnimationFrame(animRef.current);
            }
        };
    }, []);

    return <canvas ref={canvasRef} className={styles.blockLogo} />;
}

export default function LoadingScreen({ onComplete, onRevealStart, minDisplayTime = 1500, logoSrc = null }) {
    const { progress: threeProgress } = useProgress();
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('loading'); // 'loading' | 'revealing' | 'hidden'
    const startTimeRef = useRef(Date.now());
    const hasCompletedRef = useRef(false);
    const timerRefs = useRef([]);

    useEffect(
        () => () => {
            timerRefs.current.forEach(clearTimeout);
        },
        []
    );

    useEffect(() => {
        setProgress(threeProgress);
    }, [threeProgress]);

    const completeLoading = useCallback(
        (remainingTime = 0) => {
            if (hasCompletedRef.current) {
                return;
            }

            hasCompletedRef.current = true;

            const outerTimer = setTimeout(() => {
                // Start reveal phase: bg fades, text fades, logo grows
                setPhase('revealing');
                if (onRevealStart) {
                    onRevealStart();
                }

                // After logo grow + fade, fully hide and call onComplete
                const totalRevealMs = LOADING_REVEAL.LOGO_GROW_MS + LOADING_REVEAL.LOGO_FADE_MS;
                const completeTimer = setTimeout(() => {
                    setPhase('hidden');
                    if (onComplete) {
                        onComplete();
                    }
                }, totalRevealMs);
                timerRefs.current.push(completeTimer);
            }, remainingTime);

            timerRefs.current.push(outerTimer);
        },
        [onComplete, onRevealStart]
    );

    useEffect(() => {
        if (progress >= 100) {
            const elapsed = Date.now() - startTimeRef.current;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);
            completeLoading(remainingTime);
        }
    }, [progress, minDisplayTime, completeLoading]);

    useEffect(() => {
        if (hasCompletedRef.current) {
            return;
        }

        const elapsed = Date.now() - startTimeRef.current;
        const remainingTime = Math.max(0, TIMEOUT.LOADING_FORCE_COMPLETE_MS - elapsed);

        const forceCompleteTimer = setTimeout(() => {
            const currentElapsed = Date.now() - startTimeRef.current;
            const minDisplayRemaining = Math.max(0, minDisplayTime - currentElapsed);
            completeLoading(minDisplayRemaining);
        }, remainingTime);

        timerRefs.current.push(forceCompleteTimer);
        return () => clearTimeout(forceCompleteTimer);
    }, [minDisplayTime, completeLoading]);

    const isRevealing = phase === 'revealing';

    return (
        <AnimatePresence>
            {phase !== 'hidden' && (
                <motion.div
                    className={styles.loadingScreen}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0 }}
                >
                    {/* Background — fades independently */}
                    <motion.div
                        className={styles.loadingBackground}
                        animate={{ opacity: isRevealing ? 0 : 1 }}
                        transition={{ duration: LOADING_REVEAL.BG_FADE_MS / 1000, ease: 'easeOut' }}
                    />

                    {/* Logo — grows then fades */}
                    {logoSrc && (
                        <motion.div
                            className={styles.logoWrapper}
                            animate={
                                isRevealing
                                    ? { scale: LOADING_REVEAL.LOGO_GROW_SCALE, opacity: [1, 1, 0] }
                                    : { scale: 1, opacity: 1 }
                            }
                            transition={
                                isRevealing
                                    ? {
                                        scale: {
                                            duration: LOADING_REVEAL.LOGO_GROW_MS / 1000,
                                            ease: 'easeOut',
                                        },
                                        opacity: {
                                            duration: (LOADING_REVEAL.LOGO_GROW_MS + LOADING_REVEAL.LOGO_FADE_MS) / 1000,
                                            times: [0, LOADING_REVEAL.LOGO_GROW_MS / (LOADING_REVEAL.LOGO_GROW_MS + LOADING_REVEAL.LOGO_FADE_MS), 1],
                                            ease: 'easeOut',
                                        },
                                    }
                                    : { duration: 0 }
                            }
                        >
                            <BlockLogo logoSrc={logoSrc} />
                        </motion.div>
                    )}

                    {/* Text — fades out quickly */}
                    <motion.div
                        className={`${styles.loadingText}`}
                        animate={{ opacity: isRevealing ? 0 : 1 }}
                        transition={{ duration: LOADING_REVEAL.TEXT_FADE_MS / 1000, ease: 'easeOut' }}
                    >
                        {Math.floor(progress)}%
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
