import { EASING, REVEAL } from '@config/animation.config';
import { motion } from 'framer-motion';

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

export default function EduSection({ data }) {
    return (
        <>
            {data.map((entry) => (
                <div className="about-subsection" key={entry.school + entry.date}>
                    <motion.div className="about-subsection-header" variants={headerVariants}>
                        <span className="about-subsection-name">{entry.school}</span>
                    </motion.div>
                    <motion.div className="about-subsection-details" variants={headerVariants}>
                        <span className="about-subsection-course">{entry.course}</span>
                        <span className="about-subsection-date">{entry.date}</span>
                    </motion.div>
                </div>
            ))}
        </>
    );
}
