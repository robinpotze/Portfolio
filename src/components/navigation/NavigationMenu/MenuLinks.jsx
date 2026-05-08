import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './NavigationMenu.module.css';

const MENU_ITEMS = [
    { label: 'Home', link: '/' },
    { label: 'Work', link: '/work' },
    { label: 'About', link: '/about' },
    { label: 'Contact', link: '/contact' },
];

export default function MenuLinks({ open, navigateWithCurtain }) {
    const onClick = (link, label) => {
        navigateWithCurtain(link, label);
    };

    return (
        <motion.ul
            className={styles.panelList}
            data-numbering={true}
            initial="closed"
            animate={open ? 'open' : 'closed'}
            variants={{
                open: {
                    transition: {
                        staggerChildren: STAGGER.SLOW,
                        delayChildren: 0.15,
                    },
                },
            }}
        >
            {MENU_ITEMS.map((item, i) => (
                <div className={styles.panelItemBg} key={item.link}>
                    <motion.li
                        variants={{
                            closed: { y: '140%', rotate: 5 },
                            open: {
                                y: '0%',
                                rotate: 0,
                                transition: {
                                    duration: REVEAL.LONG_DURATION,
                                    ease: EASING.EMPHASIZED,
                                },
                            },
                        }}
                    >
                        <button className={styles.panelItem} data-index={i + 1} onClick={() => onClick(item.link, item.label)}>
                            {item.label}
                        </button>
                    </motion.li>
                </div>
            ))}
        </motion.ul>
    );
}
