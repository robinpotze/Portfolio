import { useCallback, useLayoutEffect, useRef, useState, createContext, useContext } from 'react';
import { useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ANIMATION_TIMING } from '@config/animations';
import { CurtainTransition } from '@components/effects';
import MenuButton from './MenuButton';
import MenuBackgroundLayers from './MenuBackgroundLayers';
import MenuPanel from './MenuPanel';
import './NavigationMenu.css';

const NavigationContext = createContext(null);
export const useNavigationCurtain = () => useContext(NavigationContext);

const BTN_COLOR = 'var(--c-LGHT)';
const BTN_COLOR_OPEN = 'var(--c-BRND)';

export const NavigationMenu = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState('Menu');
    const [curtainOpen, setCurtainOpen] = useState(false);
    const buttonRef = useRef(null);
    const busy = useRef(false);
    const pendingNavigation = useRef(null);

    const glitchR = useAnimation();
    const glitchB = useAnimation();
    const mainText = useAnimation();

    useLayoutEffect(() => {
        if (buttonRef.current) buttonRef.current.style.color = BTN_COLOR;
    }, []);

    const runGlitch = useCallback(async (newLabel) => {
        await Promise.all([
            mainText.start({
                opacity: [1, 0.3, 0.8, 0.2, 0],
                x: [0, -2, 1, -3, 0],
                transition: { duration: 0.2 }
            }),
            glitchR.start({
                opacity: [0, 0.8, 0.4, 0.9, 0.6],
                x: [0, 3, -2, 4, 2],
                y: [0, -1, 1, -2, 0],
                transition: { duration: 0.2 }
            }),
            glitchB.start({
                opacity: [0, 0.7, 0.5, 0.8, 0.5],
                x: [0, -3, 2, -4, -2],
                y: [0, 1, -1, 2, 1],
                transition: { duration: 0.2 }
            })
        ]);

        setLabel(newLabel);

        await Promise.all([
            mainText.start({
                opacity: [0, 0.2, 0.7, 0.4, 1],
                x: [0, 2, -1, 3, 0],
                transition: { duration: 0.2 }
            }),
            glitchR.start({
                opacity: [0.6, 0.9, 0.3, 0.7, 0],
                x: [2, -3, 4, -2, 0],
                y: [0, 1, -2, 1, 0],
                transition: { duration: 0.2 }
            }),
            glitchB.start({
                opacity: [0.5, 0.8, 0.4, 0.6, 0],
                x: [-2, 3, -4, 2, 0],
                y: [1, -1, 2, -1, 0],
                transition: { duration: 0.2 }
            })
        ]);
    }, [glitchR, glitchB, mainText]);

    const toggle = useCallback(() => {
        if (busy.current) return;
        busy.current = true;

        const willOpen = !open;
        setOpen(willOpen);
        runGlitch(willOpen ? 'Close' : 'Menu');

        setTimeout(() => {
            if (buttonRef.current) {
                buttonRef.current.style.color = willOpen ? BTN_COLOR_OPEN : BTN_COLOR;
            }
        }, 180);

        setTimeout(() => { busy.current = false; }, 500);
    }, [open, runGlitch]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const navigateWithCurtain = useCallback((path) => {
        pendingNavigation.current = path;
        setOpen(false);
        setTimeout(() => {
            setCurtainOpen(true);
        }, ANIMATION_TIMING.MENU_CLOSE_DELAY);
    }, []);

    const handleCurtainCoverComplete = useCallback(() => {
        if (pendingNavigation.current) {
            navigate(pendingNavigation.current, { state: { fromNavigation: true } });
            pendingNavigation.current = null;
        }
    }, [navigate]);

    const handleCurtainRevealComplete = useCallback(() => {
        setCurtainOpen(false);
    }, []);

    return (
        <NavigationContext.Provider value={{ navigateWithCurtain }}>
            <CurtainTransition
                isOpen={curtainOpen}
                direction="right"
                onCoverComplete={handleCurtainCoverComplete}
                onRevealComplete={handleCurtainRevealComplete}
            />
            <div
                className="staggered-menu-wrapper fixed-wrapper"
                data-open={open || undefined}
                data-position="left"
            >
                <MenuBackgroundLayers open={open} />

                <MenuButton
                    ref={buttonRef}
                    open={open}
                    label={label}
                    toggle={toggle}
                    mainText={mainText}
                    glitchR={glitchR}
                    glitchB={glitchB}
                />

                <MenuPanel open={open} onClose={handleClose} />
            </div>
        </NavigationContext.Provider>
    );
};

export default NavigationMenu;