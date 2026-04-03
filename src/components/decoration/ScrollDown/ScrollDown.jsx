import { motion } from 'framer-motion';

export default function ScrollDown({ color = 'var(--c-lght_100)', width = 32, height = 64, speed = 1.2 }) {
    const lineVariants = {
        initial: { opacity: 0.2 },
        animate: {
            opacity: [0.2, 1, 0.2],
            transition: {
                duration: speed,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.3,
                repeat: Infinity,
            },
        },
    };

    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={`${width}`}
            height={`${height}`}
            fill="none"
            viewBox={`0 0 ${width / 2} ${height / 1.5}`}
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Pulsing lines */}
            <motion.path d="M5 .5h6" stroke={color} strokeWidth={1} variants={lineVariants} />
            <motion.path d="M3.5 8.5h9" stroke={color} strokeWidth={1} variants={lineVariants} />
            <motion.path d="M2 16.5h12" stroke={color} strokeWidth={1} variants={lineVariants} />

            <motion.path
                d="M8 36 0 25h16z"
                fill={color}
                initial={{ y: 0 }}
                animate={{ y: [0, -2, 0] }}
                transition={{
                    duration: speed,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay: speed / 2,
                }}
            />
        </motion.svg>
    );
}
