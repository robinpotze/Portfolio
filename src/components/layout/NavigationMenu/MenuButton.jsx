/**
 * Navigation Header - Menu toggle button with glitch effect
 */

import { EASING, MENU_TIMING } from '@config/animation.config';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const MenuButton = forwardRef(({ open, label, toggle, glitchRefs }, ref) => (
    <header className="staggered-menu-header">
        <button ref={ref} className="sm-toggle" onClick={toggle} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            <motion.span
                className="sm-icon"
                aria-hidden="true"
                animate={{ rotate: open ? 90 : 0 }}
                transition={{
                    duration: open ? MENU_TIMING.TOGGLE_OPEN_DURATION : MENU_TIMING.TOGGLE_CLOSE_DURATION,
                    ease: EASING.EMPHASIZED,
                }}
            >
                <motion.img
                    src="/img/icon/PLS.svg"
                    alt=""
                    className="sm-icon-img"
                    animate={{ opacity: open ? 0 : 1, scale: open ? 0.6 : 1 }}
                    transition={{ duration: MENU_TIMING.ICON_SWAP_OUT_DURATION }}
                />
                <motion.img
                    src="/img/icon/CRS.svg"
                    alt=""
                    className="sm-icon-img"
                    animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.6 }}
                    transition={{ duration: MENU_TIMING.ICON_SWAP_IN_DURATION }}
                />
            </motion.span>

            <span className="sm-toggle-textWrap">
                <span className="sm-glitch-stack">
                    <span
                        ref={(el) => {
                            glitchRefs.current.main = el;
                        }}
                        className="sm-glitch-layer main"
                    >
                        {label}
                    </span>
                    <span
                        ref={(el) => {
                            glitchRefs.current.red = el;
                        }}
                        className="sm-glitch-layer red"
                        aria-hidden="true"
                    >
                        {label}
                    </span>
                    <span
                        ref={(el) => {
                            glitchRefs.current.blue = el;
                        }}
                        className="sm-glitch-layer blue"
                        aria-hidden="true"
                    >
                        {label}
                    </span>
                </span>
            </span>
        </button>
    </header>
));

MenuButton.displayName = 'MenuButton';

export default MenuButton;
