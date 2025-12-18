/**
 * Navigation Header - Menu toggle button with glitch effect
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const MenuButton = forwardRef(({ open, label, toggle, mainText, glitchR, glitchB }, ref) => {
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
                        <motion.span
                            className="sm-glitch-layer main"
                            animate={mainText}
                        >
                            {label}
                        </motion.span>
                        <motion.span
                            className="sm-glitch-layer red"
                            animate={glitchR}
                            aria-hidden="true"
                        >
                            {label}
                        </motion.span>
                        <motion.span
                            className="sm-glitch-layer blue"
                            animate={glitchB}
                            aria-hidden="true"
                        >
                            {label}
                        </motion.span>
                    </span>
                </span>
            </button>
        </header>
    );
});

MenuButton.displayName = 'MenuButton';

export default MenuButton;
