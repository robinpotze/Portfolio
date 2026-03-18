import { GLITCH, MENU_TIMING } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';
import { animate } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import MenuBackgroundLayers from './MenuBackgroundLayers';
import MenuButton from './MenuButton';
import MenuPanel from './MenuPanel';
import './NavigationMenu.css';

const BTN_COLOR = 'var(--c-lght_100)';
const BTN_COLOR_OPEN = 'var(--c-brnd_100)';

export default function NavigationMenu() {
    const { navigateWithTransition } = usePageTransition();
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState('Menu');
    const buttonRef = useRef(null);
    const busy = useRef(false);

    const glitchRefs = useRef({ main: null, red: null, blue: null });

    useLayoutEffect(() => {
        if (buttonRef.current) buttonRef.current.style.color = BTN_COLOR;
    }, []);

    const runGlitch = useCallback(async (newLabel) => {
        const { main, red, blue } = glitchRefs.current;
        if (!main || !red || !blue) return;

        await Promise.all([
            animate(
                main,
                {
                    opacity: [1, 0.3, 0.8, 0.2, 0],
                    x: [0, -2, 1, -3, 0],
                },
                { duration: GLITCH.DURATION }
            ),
            animate(
                red,
                {
                    opacity: [0, 0.8, 0.4, 0.9, 0.6],
                    x: [0, 3, -2, 4, 2],
                    y: [0, -1, 1, -2, 0],
                },
                { duration: GLITCH.DURATION }
            ),
            animate(
                blue,
                {
                    opacity: [0, 0.7, 0.5, 0.8, 0.5],
                    x: [0, -3, 2, -4, -2],
                    y: [0, 1, -1, 2, 1],
                },
                { duration: GLITCH.DURATION }
            ),
        ]);

        setLabel(newLabel);

        await Promise.all([
            animate(
                main,
                {
                    opacity: [0, 0.2, 0.7, 0.4, 1],
                    x: [0, 2, -1, 3, 0],
                },
                { duration: GLITCH.DURATION }
            ),
            animate(
                red,
                {
                    opacity: [0.6, 0.9, 0.3, 0.7, 0],
                    x: [2, -3, 4, -2, 0],
                    y: [0, 1, -2, 1, 0],
                },
                { duration: GLITCH.DURATION }
            ),
            animate(
                blue,
                {
                    opacity: [0.5, 0.8, 0.4, 0.6, 0],
                    x: [-2, 3, -4, 2, 0],
                    y: [1, -1, 2, -1, 0],
                },
                { duration: GLITCH.DURATION }
            ),
        ]);
    }, []);

    const toggle = useCallback(() => {
        if (busy.current) { return; }
        busy.current = true;

        const willOpen = !open;
        setOpen(willOpen);
        runGlitch(willOpen ? 'Close' : 'Menu');

        setTimeout(() => {
            if (buttonRef.current) {
                buttonRef.current.style.color = willOpen ? BTN_COLOR_OPEN : BTN_COLOR;
            }
        }, GLITCH.COLOR_DELAY_MS);

        setTimeout(() => {
            busy.current = false;
        }, GLITCH.BUSY_TIMEOUT_MS);
    }, [open, runGlitch]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && open) {
                toggle();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => { document.removeEventListener('keydown', handleKeyDown); };
    }, [open, toggle]);

    const navigateWithCurtain = useCallback(
        (path, name) => {
            setOpen(false);
            runGlitch('Menu');
            if (buttonRef.current) {
                buttonRef.current.style.color = BTN_COLOR;
            }
            setTimeout(() => {
                navigateWithTransition(path, name);
            }, MENU_TIMING.CLOSE_NAV_DELAY_MS);
        },
        [navigateWithTransition, runGlitch]
    );

    return (
        <div className="staggered-menu-wrapper fixed-wrapper" data-open={open || undefined} data-position="left">
            <MenuBackgroundLayers open={open} />

            <MenuButton ref={buttonRef} open={open} label={label} toggle={toggle} glitchRefs={glitchRefs} />

            <MenuPanel open={open} onClose={handleClose} navigateWithCurtain={navigateWithCurtain} />
        </div>
    );
}
