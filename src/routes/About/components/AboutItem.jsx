import { ANIMATION_EASING, ANIMATION_TIMING } from '@config/animation.config';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: ANIMATION_TIMING.ABOUT_ITEM_DURATION,
            ease: ANIMATION_EASING.ABOUT,
        },
    },
};

export default function AboutItem({ text, icon, meta }) {
    return (
        <motion.li className="about-item" variants={itemVariants}>
            <div className="about-item-icon">
                <img src={icon} alt="" />
            </div>
            <span className="about-item-text">{text}</span>
            {meta && <span className="about-item-meta">{meta}</span>}
        </motion.li>
    );
}
