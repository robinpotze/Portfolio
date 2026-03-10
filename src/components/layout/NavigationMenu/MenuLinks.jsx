import { motion } from 'framer-motion';

const MENU_ITEMS = [
    { label: 'Home', link: '/' },
    { label: 'Work', link: '/work' },
    { label: 'About', link: '/about' },
    { label: 'Contact', link: '/contact' }
];

export default function MenuLinks({ open, onItemClick, navigateWithCurtain }) {
    const ease = [0.22, 1, 0.36, 1];

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
                open: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
            }}
        >
            {MENU_ITEMS.map((item, i) => (
                <div className="sm-panel-item-bg" key={i}>
                    <motion.li
                        key={i}
                        variants={{
                            closed: { y: '140%', rotate: 5 },
                            open: { y: '0%', rotate: 0, transition: { duration: 0.9, ease } }
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
