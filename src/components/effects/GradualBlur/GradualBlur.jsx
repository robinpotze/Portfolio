import React, { useMemo } from 'react';
import styles from './GradualBlur.module.css';

function GradualBlur({
    position = 'bottom',
    strength = 2,
    height = '6rem',
    divCount = 5,
    exponential = false,
    zIndex = 1000,
    opacity = 1,
    curve = 'linear',
    target = 'parent',
    className = '',
    style = {}
}) {
    const curveFunc = useMemo(() => {
        const curves = {
            linear: p => p,
            bezier: p => p * p * (3 - 2 * p),
            'ease-in': p => p * p,
            'ease-out': p => 1 - Math.pow(1 - p, 2),
            'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
        };
        return curves[curve] || curves.linear;
    }, [curve]);

    const blurDivs = useMemo(() => {
        const divs = [];
        const increment = 100 / divCount;

        for (let i = 1; i <= divCount; i++) {
            const progress = curveFunc(i / divCount);
            const blurValue = exponential
                ? Math.pow(2, progress * 4) * 0.0625 * strength
                : 0.0625 * (progress * divCount + 1) * strength;

            const round1 = (v) => Math.round(v * 10) / 10;
            const p1 = round1(increment * i - increment);
            const p2 = round1(increment * i);
            const p3 = round1(increment * i + increment);
            const p4 = round1(increment * i + increment * 2);

            let gradient = `transparent ${p1}%, black ${p2}%`;
            if (p3 <= 100) gradient += `, black ${p3}%`;
            if (p4 <= 100) gradient += `, transparent ${p4}%`;

            const directions = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };
            const direction = directions[position] || 'to bottom';

            divs.push(
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        inset: '0',
                        maskImage: `linear-gradient(${direction}, ${gradient})`,
                        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
                        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                        opacity
                    }}
                />
            );
        }
        return divs;
    }, [divCount, curveFunc, exponential, strength, position, opacity]);

    const containerStyle = useMemo(() => {
        const isVertical = ['top', 'bottom'].includes(position);
        const isPageTarget = target === 'page';

        return {
            position: isPageTarget ? 'fixed' : 'absolute',
            pointerEvents: 'none',
            zIndex: isPageTarget ? zIndex + 100 : zIndex,
            [position]: 0,
            left: isVertical ? 0 : undefined,
            right: isVertical ? 0 : undefined,
            top: !isVertical ? 0 : undefined,
            bottom: !isVertical ? 0 : undefined,
            height: isVertical ? height : '100%',
            width: isVertical ? '100%' : height,
            ...style
        };
    }, [position, target, zIndex, height, style]);

    return (
        <div
            className={`${styles.gradualBlur} ${target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${className}`}
            style={containerStyle}
        >
            <div className={styles.gradualBlurInner} style={{ position: 'relative', width: '100%', height: '100%' }}>
                {blurDivs}
            </div>
        </div>
    );
}

export default React.memo(GradualBlur);
