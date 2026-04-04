import HomeCanvas from '@canvas/home/HomeCanvas';
import RadialGrid from '@components/decoration/RadialText/RadialGrid';
import RedoAnimText from '@components/decoration/RandomText/RedoAnimText';
import ScrollDown from '@components/decoration/ScrollDown';
import LaserFlow from '@components/effects/LaserFlow';
import LoadingScreen from '@components/effects/LoadingScreen';
import ErrorBoundary from '@components/ErrorBoundary';
import { EASING, LOADING, REVEAL, SCROLL_THRESHOLDS, STAGGER } from '@config/animation.config';
import { LASER_PARAMS } from '@config/laser.config';
import useScrollNavigation from '@hooks/useScrollNavigation';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

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
    const [showContent, setShowContent] = useState(skipLoading);

    const { scrollProgress, resetNavigation } = useScrollNavigation(containerRef, {
        threshold: SCROLL_THRESHOLDS.HOME_TRANSITION,
        targetPath: '/work',
        targetName: 'Work',
        direction: 'up',
    });

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

    const handleLoadingComplete = () => {
        setTimeout(() => {
            setIsLoading(false);
            setShowContent(true);
        }, LOADING.COMPLETE_DELAY_MS);
    };

    const laserProgress = showContent ? scrollProgress : 0;
    const laserParams = useMemo(() => {
        const params = {};
        for (const [key, { base, scale }] of Object.entries(LASER_PARAMS)) {
            params[key] = base + laserProgress * scale;
        }
        return params;
    }, [laserProgress]);

    return (
        <>
            {isLoading && <LoadingScreen onComplete={handleLoadingComplete} minDisplayTime={LOADING.MIN_DISPLAY_MS} logoSrc="/img/logo/logo.svg" />}
            <div
                className={styles.page}
                ref={containerRef}
                style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.6s ease-out', pointerEvents: showContent ? 'auto' : 'none' }}
            >
                <LaserFlow
                    horizontalSizing={laserParams.horizontalSizing}
                    verticalSizing={laserParams.verticalSizing}
                    horizontalBeamOffset={0}
                    verticalBeamOffset={laserParams.verticalBeamOffset}
                    color="#29D8FF"
                    fogIntensity={laserParams.fogIntensity}
                    wispSpeed={laserParams.wispSpeed}
                    wispIntensity={laserParams.wispIntensity}
                    decay={laserParams.decay}
                />
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
                            <img className={styles.accentDecal} src="img/decal/OFS.svg" alt="Offset cyberpunk dorito decal" />
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
                            <img className={styles.sideDecal} src="img/icon/CRS.svg" alt="divider" />
                            <p className={`deco-tiny ${styles.sideDecoText}`}>SDD.01</p>
                        </motion.div>
                        <motion.img className={styles.sideDecal} src="img/decal/MORSE.svg" alt="robin potze in barcode" variants={sideItemVariants} />
                        <motion.img
                            className={styles.sideDecal}
                            src="img/decal/PILL.svg"
                            alt="pill with four arrows point downwards"
                            variants={sideItemVariants}
                        />
                        <motion.img
                            className={`${styles.sideDecal} ${styles.decalSound}`}
                            src="img/decal/SND.svg"
                            alt="ROBIN in sound waves"
                            variants={sideItemVariants}
                        />
                    </motion.div>
                </div>
                <div className={styles.transitionSection} />
                <ErrorBoundary>
                    <HomeCanvas scrollProgress={scrollProgress} startAnimations={showContent} />
                </ErrorBoundary>
            </div>
        </>
    );
}
