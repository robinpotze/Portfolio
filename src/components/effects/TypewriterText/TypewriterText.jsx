/* eslint-disable react/prop-types */

import { REVEAL, TYPEWRITER } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const rowVariants = {
    hidden: { opacity: 0, x: REVEAL.X_OFFSET },
    visible: { opacity: 1, x: 0, transition: { duration: REVEAL.DURATION } },
};

export default function TypewriterText({ lines, charSpeed = TYPEWRITER.CHAR_SPEED, rowPause = TYPEWRITER.ROW_PAUSE, delay = 0, className, rowClassName }) {
    const [currentLine, setCurrentLine] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (currentLine >= lines.length) return;

        const line = lines[currentLine];

        if (currentChar < line.length) {
            timerRef.current = setTimeout(
                () => setCurrentChar((c) => c + 1),
                currentLine === 0 && currentChar === 0 ? delay + charSpeed : charSpeed
            );
        } else {
            timerRef.current = setTimeout(() => {
                setCurrentLine((l) => l + 1);
                setCurrentChar(0);
            }, rowPause);
        }

        return () => clearTimeout(timerRef.current);
    }, [currentLine, currentChar, lines, charSpeed, rowPause, delay]);

    return (
        <div className={className}>
            <AnimatePresence>
                {lines.map((line, i) => {
                    if (i > currentLine) return null;

                    const text = i < currentLine ? line : line.slice(0, currentChar);

                    return (
                        <motion.pre
                            key={`${i}-${line}`}
                            className={rowClassName}
                            variants={rowVariants}
                            initial='hidden'
                            animate='visible'
                        >
                            {text}
                            {i === currentLine && currentLine < lines.length && TYPEWRITER.CURSOR}
                        </motion.pre>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
