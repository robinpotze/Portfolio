import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const BG_COLORS = ['var(--c-LGHT)', 'var(--c-BRND)'];

export default function MenuBackgroundLayers({ open }) {
    const ease = [0.22, 1, 0.36, 1];

    return (
        <div className="sm-prelayers" aria-hidden="true">
            {BG_COLORS.map((color, i) => (
                <motion.div
                    key={i}
                    className="sm-prelayer"
                    style={{ background: color }}
                    initial={{ x: '-100%' }}
                    animate={{ x: open ? '0%' : '-100%' }}
                    transition={{ duration: 0.2, ease, delay: i * 0.07 }}
                />
            ))}
        </div>
    );
}

MenuBackgroundLayers.propTypes = {
    open: PropTypes.bool.isRequired,
};
