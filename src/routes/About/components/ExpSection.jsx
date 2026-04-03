import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'framer-motion';
import AboutItem from './AboutItem';

const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

export default function ExpSection({ data }) {
    return (
        <>
            {data.map((entry) => (
                <div className="about-subsection" key={entry.name + entry.date}>
                    <motion.div className="about-subsection-header" variants={headerVariants}>
                        <span className="about-subsection-name">{entry.name}</span>
                        <span className="about-subsection-function">{entry.function}</span>
                        <span className="about-subsection-date">{entry.date}</span>
                    </motion.div>
                    <ul className="about-list">
                        {entry.details.map((item) => (
                            <AboutItem key={item.text} text={item.text} icon={item.icon} />
                        ))}
                    </ul>
                </div>
            ))}
        </>
    );
}
