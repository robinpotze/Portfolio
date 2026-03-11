import { AnimatePresence, motion } from 'framer-motion';
import MenuLinks from './MenuLinks';
import MenuSocials from './MenuSocials';

export default function MenuPanel({ open, onClose, navigateWithCurtain }) {
    const ease = [0.22, 1, 0.36, 1];

    return (
        <AnimatePresence>
            <motion.aside
                className="staggered-menu-panel"
                aria-hidden={!open}
                inert={!open ? '' : undefined}
                initial={{ x: '-100%' }}
                animate={{ x: open ? '0%' : '-100%' }}
                transition={{
                    duration: open ? 0.3 : 0.2,
                    ease: open ? ease : [0.55, 0.06, 0.68, 0.19],
                    delay: open ? 0.22 : 0,
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
