import HomeCanvas from '@canvas/home/HomeCanvas';
import RadialGrid from '@components/decoration/RadialText/RadialGrid';
import RedoAnimText from '@components/decoration/RandomText/RedoAnimText';
import ScrollDown from '@components/decoration/ScrollDown';
import CurtainTransition from '@components/effects/CurtainTransition';
import LaserFlow from '@components/effects/LaserFlow';
import LoadingScreen from '@components/effects/LoadingScreen';
import ErrorBoundary from '@components/ErrorBoundary';
import NavigationMenu from '@components/layout/NavigationMenu/NavigationMenu';
import { ANIMATION_TIMING, SCROLL_THRESHOLDS } from '@config/animation.config';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);
    const hasNavigated = useRef(false);

    const skipLoading = !!(location.state?.fromNavigation);
    const [isLoading, setIsLoading] = useState(!skipLoading);
    const [showContent, setShowContent] = useState(skipLoading);
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
        hasNavigated.current = false;

        // Clear navigation state after reading it
        if (location.state?.fromNavigation) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.fromNavigation]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = Math.max(0, container.scrollTop);
            const scrollHeight = Math.max(1, container.scrollHeight - container.clientHeight);
            const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

            setScrollProgress(progress);

            // Trigger curtain at threshold
            if (progress >= SCROLL_THRESHOLDS.HOME_TRANSITION && !hasNavigated.current) {
                setCurtainOpen(true);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCoverComplete = () => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;

        // Navigate with state to skip loading on return
        navigate('/work', { state: { fromNavigation: true } });
    };

    const handleLoadingComplete = () => {
        setTimeout(() => {
            setIsLoading(false);
            setShowContent(true);
        }, ANIMATION_TIMING.LOADING_COMPLETE_DELAY);
    };

    const laserProgress = showContent ? scrollProgress : 0;
    const horizontalSizing = 0 + (laserProgress * 2);
    const verticalSizing = 0 + (laserProgress * 3);
    const verticalBeamOffset = -0.6 + (laserProgress * 0.1);
    const fogIntensity = 0.2 + (laserProgress * 0.2);
    const wispSpeed = 50.0 - (laserProgress * 40.0);
    const wispIntensity = 5.0 + (laserProgress * 5.0);
    const decay = 1.5 - (laserProgress * 0.5);

    return (
        <>
            {isLoading && (
                <LoadingScreen
                    onComplete={handleLoadingComplete}
                    minDisplayTime={ANIMATION_TIMING.LOADING_MIN_DISPLAY}
                    logoSrc="/img/logo/logo.svg"
                />
            )}
            <div className='home-page' ref={containerRef} style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.6s ease-out', pointerEvents: showContent ? 'auto' : 'none' }}>
                <CurtainTransition
                    isOpen={curtainOpen}
                    direction="up"
                    pageName="Work"
                    onCoverComplete={handleCoverComplete}
                />
                <LaserFlow
                    horizontalSizing={horizontalSizing}
                    verticalSizing={verticalSizing}
                    horizontalBeamOffset={0.0}
                    verticalBeamOffset={verticalBeamOffset}
                    color="#29D8FF"
                    fogIntensity={fogIntensity}
                    wispSpeed={wispSpeed}
                    wispIntensity={wispIntensity}
                    decay={decay}
                />
                <div className='home-section'>
                    <div className='home-content'>
                        <NavigationMenu />
                        <p className='deco-small home-name'>ROBIN <br /> POTZE</p>
                        <p className='deco-tiny home-quote'>
                            | THOSE WHO DOUBT |<br />
                            | CAST THEMSELVES|<br />
                            | INTO A VOID |<br />
                            <RedoAnimText delay={0.5} /><br />
                            | AMBIGUOUS AMBIVALENCE |
                        </p>                        <div className='home-accents-bottom'>
                            <RadialGrid type='CRCL' />
                            <img className='home-accent-decal' src='img/decal/OFS.svg' alt='Offset cyberpunk dorito decal' />
                        </div>
                        <div className='home-scroll-bottom'>
                            <ScrollDown />
                        </div>
                    </div>
                    <div className='home-side'>
                        <div className='home-side-rotation-wrapper'>
                            <div className='home-side-flavour-text r90'>
                                <p className='deco-tiny home-side-text'>assertThat(AMBIGUOUS.AMBIVALENCE)</p>
                                <p className='deco-tiny home-side-text-brand'>willReturn("ESCAPE WILL MAKE ME GOD")</p>
                            </div>
                        </div>
                        <div className='home-side-divider r90'>
                            <img className='home-side-decal' src='img/icon/CRS.svg' alt='divider' />
                            <p className='deco-tiny home-side-deco-text'>SDD.01</p>
                        </div>
                        <img className='home-side-decal' src='img/decal/MORSE.svg' alt='robin potze in barcode' />
                        <img className='home-side-decal' src='img/decal/PILL.svg' alt='pill with four arrows point downwards' />
                        <img className='home-side-decal' id='decal-sound' src='img/decal/SND.svg' alt='ROBIN in sound waves' />
                    </div>
                </div>
                <div className='home-transition-section' />
                <ErrorBoundary>
                    <HomeCanvas scrollProgress={scrollProgress} startAnimations={showContent} />
                </ErrorBoundary>
            </div>
        </>
    );
}

