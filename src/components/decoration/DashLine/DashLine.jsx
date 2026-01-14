import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

export default function DashLine({ direction }) {
    const svgRef = useRef(null);
    const [lineLength, setLineLength] = useState(0);
    const width = direction === "Horizontal" ? "100%" : "1";
    const height = direction === "Horizontal" ? "1" : "100%";

    useEffect(() => {
        if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            setLineLength(direction === "Horizontal" ? rect.width : rect.height);
        }
    }, [direction]);

    const isHorizontal = direction === "Horizontal";

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
        >
            {isHorizontal ? (
                <path
                    d={`M0 1 H${lineLength}`}
                    stroke="var(--c-LGHT)"
                    strokeWidth="2"
                    strokeDasharray="32 128 128 32 128 32 128 128"
                    fill="none"
                />
            ) : (
                <path
                    d={`M0 1 V${lineLength}`}
                    stroke="var(--c-LGHT)"
                    strokeWidth="2"
                    strokeDasharray="32, 128, 128, 128"
                    fill="none"
                />
            )}
        </svg>
    );
}

DashLine.propTypes = {
    direction: PropTypes.oneOf(["Horizontal", "Vertical"]).isRequired,
};
