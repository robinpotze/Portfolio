import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useNavigationCurtain } from './NavigationMenu';

const MENU_ITEMS = [
    { label: 'Work', link: '/work' },
    { label: 'About', link: '/about' },
    { label: 'Contact', link: '/contact' }
];

export default function MenuLinks({ open, onItemClick }) {
    const ease = [0.22, 1, 0.36, 1];
    const { navigateWithCurtain } = useNavigationCurtain();

    const handleClick = (link) => {
        navigateWithCurtain(link);
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
                            onClick={() => handleClick(item.link)}
                        >
                            {item.label}
                        </button>
                    </motion.li>
                </div>
            ))}
        </motion.ul>
    );
}

MenuLinks.propTypes = {
    open: PropTypes.bool.isRequired,
    onItemClick: PropTypes.func.isRequired,
};
