import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import FluidSim from './FluidSim';

/**
 * Screen-space fluid for the current canvas. Returns a ref whose .current is the FluidSim, or null when
 * iterations is 0. The caller drives it with .current.update(pointer, delta) and reads .current.velocity.
 */
export default function useFluidSim(iterations) {
    const gl = useThree((state) => state.gl);
    const aspect = useThree((state) => state.size.width / state.size.height);
    const fluidRef = useRef(null);

    useEffect(() => {
        if (!iterations) {
            return;
        }
        fluidRef.current = new FluidSim(gl, aspect, iterations);
        return () => {
            fluidRef.current.dispose();
            fluidRef.current = null;
        };
        // aspect is read once here; changes go through resize() below without recompiling the passes.
    }, [gl, iterations]);

    useEffect(() => {
        fluidRef.current?.resize(aspect);
    }, [aspect]);

    return fluidRef;
}
