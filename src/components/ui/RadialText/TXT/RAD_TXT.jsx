import { useRef, useEffect } from 'react';
import { animate } from 'framer-motion';

export default function RAD_TXT({ value }) {
    const textRef = useRef(null);
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (!textRef.current || value === prevValueRef.current) {
            return;
        }

        const oldValue = prevValueRef.current;
        prevValueRef.current = value;

        animate(oldValue, value, {
            duration: 0.214,
            onUpdate: (latest) => {
                if (textRef.current) {
                    textRef.current.textContent = Math.round(latest).toString().padStart(3, '0');
                }
            },
        });
    }, [value]);

    return (
        <p ref={textRef} className="tech-small" id={'rad-text-' + value}>
            {value.toString().padStart(3, '0')}
        </p>
    );
}
