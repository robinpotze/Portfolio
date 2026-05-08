import MorseDecal from '@/assets/decals/MORSE.svg?react';
import OfsDecal from '@/assets/decals/OFS.svg?react';
import PillDecal from '@/assets/decals/PILL.svg?react';
import SndDecal from '@/assets/decals/SND.svg?react';
import CrsIcon from '@/assets/icons/CRS.svg?react';
import ErrorBoundary from '@components/ErrorBoundary';
import LoadingScreen from '@components/navigation/LoadingScreen';
import RadialGrid from '@components/ui/RadialText/RadialGrid';
import RedoAnimText from '@components/ui/RandomText/RedoAnimText';
import ScrollDown from '@components/ui/ScrollDown';
import { EASING, REVEAL, SCROLL_THRESHOLDS, STAGGER, TIMEOUT } from '@config/animation.config';
import { LASER_PARAMS } from '@config/laser.config';
import useScrollNavigation from '@hooks/useScrollNavigation';
import { useGLTF } from '@react-three/drei';
import { motion } from 'motion/react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const HomeCanvas = lazy(() => import('@canvas/home/HomeCanvas'));

const sideContainerVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: STAGGER.DEFAULT,
            delayChildren: REVEAL.DELAY,
        },
    },
};

const sideItemVariants = {
    hidden: {
        opacity: 0,
        x: REVEAL.X_OFFSET * 4,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);

    const skipLoading = !!location.state?.fromNavigation;
    const [isLoading, setIsLoading] = useState(!skipLoading);
    const [sceneStarted, setSceneStarted] = useState(skipLoading);
    const [showContent, setShowContent] = useState(skipLoading);
    const loadingTimerRef = useRef(null);

    const { scrollProgress, resetNavigation } = useScrollNavigation(containerRef, {
        threshold: SCROLL_THRESHOLDS.HOME_TRANSITION,
        targetPath: '/work',
        targetName: 'Work',
        direction: 'up',
    });

    useEffect(() => {
        useGLTF.preload('/assets/3d/Logo.glb');
        useGLTF.preload('/assets/3d/Wall.glb');
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
        resetNavigation();

        // Clear navigation state after reading it
        if (location.state?.fromNavigation) {
            navigate('.', { replace: true, state: {} });
        }
    }, [location.state?.fromNavigation, resetNavigation, navigate]);

    const onRevealStart = useCallback(() => {
        setSceneStarted(true);
    }, []);

    const onLoadingComplete = () => {
        loadingTimerRef.current = setTimeout(() => {
            setIsLoading(false);
            setShowContent(true);
        }, TIMEOUT.COMPLETE_DELAY_MS);
    };

    useEffect(
        () => () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
            }
        },
        []
    );

    const laserProgress = sceneStarted ? scrollProgress : 0;
    const laserParams = useMemo(() => {
        const params = {};
        for (const [key, { base, scale }] of Object.entries(LASER_PARAMS)) {
            params[key] = base + laserProgress * scale;
        }
        return params;
    }, [laserProgress]);

    return (
        <>
            {isLoading && (
                <LoadingScreen onComplete={onLoadingComplete} onRevealStart={onRevealStart} minDisplayTime={TIMEOUT.LOADING_MIN_DISPLAY_MS} logoSrc="/assets/img/logo/logo.svg" />
            )}
            <div
                className={styles.page}
                ref={containerRef}
                style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.6s ease-out', pointerEvents: showContent ? 'auto' : 'none' }}
            >
                <div className={styles.section}>
                    <div className={styles.content}>
                        <p className={`deco-small ${styles.name}`}>
                            ROBIN <br /> POTZE
                        </p>
                        <p className={`deco-tiny ${styles.quote}`}>
                            | THOSE WHO DOUBT |<br />
                            | CAST THEMSELVES|
                            <br />
                            | INTO A VOID |<br />
                            <RedoAnimText delay={0.5} />
                            <br />| AMBIGUOUS AMBIVALENCE |
                        </p>{' '}
                        <div className={styles.accentsBottom}>
                            <RadialGrid type="CRCL" />
                            <OfsDecal className={styles.accentDecal} aria-hidden="true" />
                        </div>
                        <div className={styles.scrollBottom}>
                            <ScrollDown />
                        </div>
                    </div>
                    <motion.div
                        className={styles.side}
                        variants={sideContainerVariants}
                        initial="hidden"
                        animate={showContent ? 'visible' : 'hidden'}
                    >
                        <motion.div className={styles.sideRotationWrapper} variants={sideItemVariants}>
                            <div className={`${styles.sideFlavourText} r90`}>
                                <p className="deco-tiny">assertThat(AMBIGUOUS.AMBIVALENCE)</p>
                                <p className={`deco-tiny ${styles.sideTextBrand}`}>willReturn("ESCAPE WILL MAKE ME GOD")</p>
                            </div>
                        </motion.div>
                        <motion.div className={`${styles.sideDivider} r90`} variants={sideItemVariants}>
                            <CrsIcon className={styles.sideDividerIcon} aria-hidden="true" />
                            <p className={`deco-tiny ${styles.sideDecoText}`}>SDD.01</p>
                        </motion.div>
                        <motion.div variants={sideItemVariants}>
                            <MorseDecal aria-hidden="true" />
                        </motion.div>
                        <motion.div variants={sideItemVariants}>
                            <PillDecal aria-hidden="true" />
                        </motion.div>
                        <motion.div className={styles.decalSound} variants={sideItemVariants}>
                            <SndDecal aria-hidden="true" />
                        </motion.div>
                    </motion.div>
                </div>
                <div className={styles.transitionSection} />
            </div>
            <ErrorBoundary>
                <Suspense fallback={null}>
                    <HomeCanvas scrollProgress={scrollProgress} startAnimations={sceneStarted} laserParams={laserParams} />
                </Suspense>
            </ErrorBoundary>
        </>
    );
}
