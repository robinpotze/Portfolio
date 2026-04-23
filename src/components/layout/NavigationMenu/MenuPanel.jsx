import { EASING, REVEAL } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import MenuLinks from './MenuLinks';
import MenuSocials from './MenuSocials';
import styles from './NavigationMenu.module.css';

export default function MenuPanel({ open, onClose: _onClose, navigateWithCurtain }) {
    return (
        <AnimatePresence>
            <motion.aside
                className={styles.panel}
                aria-hidden={!open}
                inert={!open}
                initial={{ x: '-100%' }}
                animate={{ x: open ? '0%' : '-100%' }}
                transition={{
                    duration: open ? REVEAL.QUICK_DURATION : REVEAL.EXIT_DURATION,
                    ease: open ? EASING.EMPHASIZED : EASING.EXIT,
                    delay: open ? REVEAL.EXIT_DURATION : 0,
                }}
            >
                <div className={styles.panelInner}>
                    <MenuLinks open={open} navigateWithCurtain={navigateWithCurtain} />
                    <MenuSocials open={open} />
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
