/* eslint-disable react/prop-types */

import { EASING, MENU_TIMING } from '@config/animation.config';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
    { label: 'Home', link: '/' },
    { label: 'Work', link: '/work' },
    { label: 'About', link: '/about' },
    { label: 'Contact', link: '/contact' }
];

export default function MenuLinks({ open, navigateWithCurtain }) {
    const handleClick = (link, label) => {
        navigateWithCurtain(link, label);
    };

    return (
        <motion.ul
            className="sm-panel-list"
            data-numbering={true}
            initial="closed"
            animate={open ? 'open' : 'closed'}
            variants={{
                open: {
                    transition: {
                        staggerChildren: MENU_TIMING.ITEM_STAGGER,
                        delayChildren: MENU_TIMING.ITEM_DELAY_BASE,
                    },
                }
            }}
        >
            {MENU_ITEMS.map((item, i) => (
                <div className="sm-panel-item-bg" key={item.link}>
                    <motion.li
                        variants={{
                            closed: { y: '140%', rotate: 5 },
                            open: {
                                y: '0%',
                                rotate: 0,
                                transition: {
                                    duration: MENU_TIMING.ITEM_DURATION,
                                    ease: EASING.EMPHASIZED,
                                },
                            }
                        }}
                    >
                        <button
                            className="sm-panel-item"
                            data-index={i + 1}
                            onClick={() => handleClick(item.link, item.label)}
                        >
                            {item.label}
                        </button>
                    </motion.li>
                </div>
            ))}
        </motion.ul>
    );
}
