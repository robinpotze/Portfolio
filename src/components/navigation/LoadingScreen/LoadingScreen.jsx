import { REVEAL, TIMEOUT } from '@config/animation.config';
import { useProgress } from '@react-three/drei';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './LoadingScreen.module.css';

const CRYPTIC_MESSAGES = [
    'INITIATING NEURAL HANDSHAKE',
    'DECRYPTING VISUAL CORTEX',
    'PARSING QUANTUM MANIFOLD',
    'COMPILING VOID MATRICES',
    'SYNCHRONIZING DARK ARRAYS',
    'RESOLVING TEMPORAL DRIFT',
    'CALIBRATING PHASE VECTORS',
    'TRAVERSING DATA STREAMS',
    'BOOTSTRAPPING SIGNAL MESH',
    'INDEXING ENTROPY FIELDS',
];

const CYCLE_INTERVAL = 900;
const BLOCK_SIZE = 6;
const BLOCK_GAP = 2;
const GLITCH_CHARS = '!@#$%^&*01<>{}[]';

function BlockLogo({ logoSrc, cycleIndex }) {
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

    useEffect(() => {
        cycleStartRef.current = Date.now();
    }, [cycleIndex]);

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

            const elapsed = Date.now() - cycleStartRef.current;
            const t = Math.min(elapsed / CYCLE_INTERVAL, 1);

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

export default function LoadingScreen({ onComplete, minDisplayTime = 1500, logoSrc = null }) {
    const { progress: threeProgress } = useProgress();
    const [progress, setProgress] = useState(0);
    const [isHidden, setIsHidden] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);
    const [displayText, setDisplayText] = useState(CRYPTIC_MESSAGES[0]);
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
                setIsHidden(true);
                const innerTimer = setTimeout(() => {
                    if (onComplete) {
                        onComplete();
                    }
                }, TIMEOUT.LOADING_FADE_MS);
                timerRefs.current.push(innerTimer);
            }, remainingTime);

            timerRefs.current.push(outerTimer);
        },
        [onComplete]
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

    // Cycle messages
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % CRYPTIC_MESSAGES.length);
        }, CYCLE_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    // Glitch text decode effect
    useEffect(() => {
        const target = CRYPTIC_MESSAGES[messageIndex];
        let frame = 0;
        const totalFrames = 8;
        let rafId;

        const decode = () => {
            frame++;
            const ratio = frame / totalFrames;
            const decoded = target
                .split('')
                .map((char, i) => {
                    if (char === ' ') {
                        return ' ';
                    }
                    if (ratio > i / target.length) {
                        return char;
                    }
                    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                })
                .join('');
            setDisplayText(decoded);

            if (frame < totalFrames) {
                rafId = requestAnimationFrame(decode);
            }
        };

        decode();
        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [messageIndex]);

    return (
        <AnimatePresence>
            {!isHidden && (
                <motion.div
                    className={styles.loadingScreen}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: REVEAL.DURATION, ease: 'easeOut' }}
                >
                    {logoSrc && <BlockLogo logoSrc={logoSrc} cycleIndex={messageIndex} />}
                    <div className={`${styles.loadingText} deco-small`}>
                        {displayText} ::: {Math.floor(progress)}%
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
