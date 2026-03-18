/* eslint-disable react/prop-types */

import { EASING, MENU_TIMING } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import MenuLinks from './MenuLinks';
import MenuSocials from './MenuSocials';

export default function MenuPanel({ open, onClose, navigateWithCurtain }) {
    return (
        <AnimatePresence>
            <motion.aside
                className="staggered-menu-panel"
                aria-hidden={!open}
                inert={open ? undefined : ''}
                initial={{ x: '-100%' }}
                animate={{ x: open ? '0%' : '-100%' }}
                transition={{
                    duration: open ? MENU_TIMING.PANEL_OPEN_DURATION : MENU_TIMING.PANEL_CLOSE_DURATION,
                    ease: open ? EASING.EMPHASIZED : EASING.EXIT,
                    delay: open ? MENU_TIMING.PANEL_OPEN_DELAY : 0,
                }}
            >
                <div className="sm-panel-inner">
                    <MenuLinks open={open} navigateWithCurtain={navigateWithCurtain} />
                    <MenuSocials open={open} />
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
