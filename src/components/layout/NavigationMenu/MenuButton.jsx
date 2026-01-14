/**
 * Navigation Header - Menu toggle button with glitch effect
 */

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const MenuButton = forwardRef(({ open, label, toggle, glitchRefs }, ref) => {
    const ease = [0.22, 1, 0.36, 1];

    return (
        <header className="staggered-menu-header">
            <button
                ref={ref}
                className="sm-toggle"
                onClick={toggle}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
            >
                <motion.span
                    className="sm-icon"
                    aria-hidden="true"
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: open ? 0.6 : 0.35, ease }}
                >
                    <motion.img
                        src="/img/icon/PLS.svg"
                        alt=""
                        className="sm-icon-img"
                        animate={{ opacity: open ? 0 : 1, scale: open ? 0.6 : 1 }}
                        transition={{ duration: 0.28 }}
                    />
                    <motion.img
                        src="/img/icon/CRS.svg"
                        alt=""
                        className="sm-icon-img"
                        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.6 }}
                        transition={{ duration: 0.32 }}
                    />
                </motion.span>

                <span className="sm-toggle-textWrap">
                    <span className="sm-glitch-stack">
                        <span
                            ref={(el) => { glitchRefs.current.main = el; }}
                            className="sm-glitch-layer main"
                        >
                            {label}
                        </span>
                        <span
                            ref={(el) => { glitchRefs.current.red = el; }}
                            className="sm-glitch-layer red"
                            aria-hidden="true"
                        >
                            {label}
                        </span>
                        <span
                            ref={(el) => { glitchRefs.current.blue = el; }}
                            className="sm-glitch-layer blue"
                            aria-hidden="true"
                        >
                            {label}
                        </span>
                    </span>
                </span>
            </button>
        </header>
    );
});

MenuButton.displayName = 'MenuButton';

export default MenuButton;
