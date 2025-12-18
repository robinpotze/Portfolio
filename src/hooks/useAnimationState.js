import { useEffect, useRef } from 'react';

/**
 * Manages shared animation state for entry animations
 * Tracks animation timing and completion state, resets when route changes
 * 
 * @param {string} routeName - Current route identifier for reset detection
 * @returns {object} Animation state refs
 */
export function useAnimationState(routeName) {
    const animationStartTime = useRef(null);
    const hasCompletedEntry = useRef(false);
    const initializedRoute = useRef(routeName);

    useEffect(() => {
        if (initializedRoute.current !== routeName) {
            hasCompletedEntry.current = false;
            animationStartTime.current = null;
            initializedRoute.current = routeName;
        }
    }, [routeName]);

    return { animationStartTime, hasCompletedEntry, initializedRoute };
}
