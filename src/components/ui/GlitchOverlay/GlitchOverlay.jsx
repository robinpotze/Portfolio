import { useEffect, useRef } from 'react';

import styles from './GlitchOverlay.module.css';

const FILTER_ID = 'glitchDisplace';

export default function GlitchOverlay({ active, warningText = 'WARNING: SIGNAL INTERCEPT' }) {
    const filterAnimRef = useRef(null);

    useEffect(() => {
        if (active) {
            filterAnimRef.current?.beginElement();
        }
    }, [active]);

    return (
        <>
            <svg className={styles.svgFilters} aria-hidden="true">
                <defs>
                    <filter id={FILTER_ID}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.15" numOctaves="1" seed="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G">
                            <animate
                                ref={filterAnimRef}
                                attributeName="scale"
                                values="0;70;0;55;0;85;0;0;45;40;0;75;0;0"
                                keyTimes="0;0.04;0.07;0.10;0.13;0.16;0.22;0.35;0.38;0.55;0.62;0.72;0.78;1"
                                dur="1.2s"
                                begin="indefinite"
                                fill="freeze"
                            />
                        </feDisplacementMap>
                    </filter>
                </defs>
            </svg>

            {active && (
                <div className={styles.overlay} aria-hidden="true">
                    <div className={styles.layer1} />
                    <div className={styles.layer2} />
                    <div className={styles.flash} />
                    <span className={styles.warning}>{warningText}</span>
                </div>
            )}
        </>
    );
}

export { FILTER_ID };
