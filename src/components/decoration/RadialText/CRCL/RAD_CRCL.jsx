import { motion } from 'framer-motion';

export default function RAD_CRCL({ value = 0 }) {
    const radius = 5;
    const width = 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 360) * circumference;

    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="rad-circle"
            id={`rad-circle-${value}`}
        >
            <circle
                cx="6"
                cy="6"
                r={radius}
                fill="none"
                stroke="var(--c-TRNS)"
                strokeWidth={width}
            />
            <motion.circle
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                cx="6"
                cy="6"
                r={radius}
                fill="none"
                stroke="var(--c-LGHT)"
                strokeWidth={width}
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                transform={`rotate(-90 6 6)`}
            />
        </svg>
    );
}