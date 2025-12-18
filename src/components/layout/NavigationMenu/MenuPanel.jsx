/**
 * Menu Panel - Side panel with logo, links, and socials
 */

import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MenuLinks from './MenuLinks';
import MenuSocials from './MenuSocials';

export default function MenuPanel({ open, onClose }) {
    const navigate = useNavigate();
    const ease = [0.22, 1, 0.36, 1];

    return (
        <AnimatePresence>
            <motion.aside
                className="staggered-menu-panel"
                aria-hidden={!open}
                initial={{ x: '-100%' }}
                animate={{ x: open ? '0%' : '-100%' }}
                transition={{
                    duration: open ? 0.3 : 0.2,
                    ease: open ? ease : [0.55, 0.06, 0.68, 0.19],
                    delay: open ? 0.22 : 0
                }}
            >
                <div className="sm-panel-inner">
                    <motion.div
                        className='sm-panel-logo'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: open ? 1 : 0 }}
                    >
                        <a
                            href="/"
                            className="sm-panel-logo-link"
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                navigate('/');
                            }}
                        >
                            <img src="/img/logo/logo.svg" alt="Logo" />
                        </a>
                    </motion.div>

                    <MenuLinks open={open} onItemClick={onClose} />

                    <MenuSocials open={open} />
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}

MenuPanel.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};
