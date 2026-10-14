import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import FluidSim from './FluidSim';

/**
 * Screen-space fluid driven by pointer movement. Returns a ref whose .current is the FluidSim,
 * or null when iterations is 0. Read .current.velocity every frame: the buffer swaps each step.
 */
export default function useFluidSim(iterations) {
    const gl = useThree((state) => state.gl);
    const size = useThree((state) => state.size);
    const fluidRef = useRef(null);
    const lastPointer = useRef(null);

    useEffect(() => {
        if (!iterations) {
            return;
        }
        const fluid = new FluidSim(gl, size.width / size.height, iterations);
        fluidRef.current = fluid;
        return () => {
            fluidRef.current = null;
            fluid.dispose();
        };
    }, [gl, size.width, size.height, iterations]);

    useFrame(({ pointer }, delta) => {
        // Pointer is in [-1, 1]; the fluid works in [0, 1] UV space. Track it even while the fluid is off.
        const last = (lastPointer.current ??= pointer.clone());
        const dx = (pointer.x - last.x) / 2;
        const dy = (pointer.y - last.y) / 2;
        last.copy(pointer);

        const fluid = fluidRef.current;
        if (!fluid) {
            return;
        }
        // ponytail: deltas over 0.1 UV in one frame are pointer jumps (first move, re-entry, touch tap), not motion; raise if fast flicks get dropped.
        if ((dx !== 0 || dy !== 0) && Math.hypot(dx, dy) < 0.1) {
            fluid.splat((pointer.x + 1) / 2, (pointer.y + 1) / 2, dx, dy);
        }
        fluid.step(Math.min(delta, 1 / 60));
    });

    return fluidRef;
}
