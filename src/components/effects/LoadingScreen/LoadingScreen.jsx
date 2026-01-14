import { ANIMATION_TIMING } from '@config/animations';
import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({
    onComplete,
    minDisplayTime = 1500,
    logoSrc = null
}) {
    const { progress: threeProgress } = useProgress();
    const [progress, setProgress] = useState(0);
    const [isHidden, setIsHidden] = useState(false);
    const startTimeRef = useRef(Date.now());
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        setProgress(threeProgress);
    }, [threeProgress]);

    useEffect(() => {
        if (progress >= 100 && !hasCompletedRef.current) {
            hasCompletedRef.current = true;

            const elapsed = Date.now() - startTimeRef.current;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);

            setTimeout(() => {
                setIsHidden(true);
                setTimeout(() => {
                    if (onComplete) {
                        onComplete();
                    }
                }, ANIMATION_TIMING.LOADING_FADE_OUT);
            }, remainingTime);
        }
    }, [progress, minDisplayTime, onComplete]);

    return (
        <AnimatePresence>
            {!isHidden && (
                <motion.div
                    className={styles.loadingScreen}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    {logoSrc && (
                        <motion.img
                            src={logoSrc}
                            alt="Loading"
                            className={styles.loadingLogo}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    )}
                    <div className={styles.loadingBarContainer}>
                        <motion.div
                            className={styles.loadingBar}
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </div>
                    <div className={`${styles.loadingText} deco-small`}>
                        LOADING // {Math.floor(progress)}%
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
