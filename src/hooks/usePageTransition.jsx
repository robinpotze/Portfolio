import CurtainTransition from '@components/navigation/CurtainTransition';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PageTransitionContext = createContext(null);

export function usePageTransition() {
    const context = useContext(PageTransitionContext);
    if (!context) {
        throw new Error('usePageTransition must be used within PageTransitionProvider');
    }
    return context;
}

export function PageTransitionProvider({ children }) {
    const navigate = useNavigate();
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [pageName, setPageName] = useState(null);
    const [direction, setDirection] = useState('right');
    const [transitionKey, setTransitionKey] = useState(0);
    const pendingNavigation = useRef(null);
    const pendingState = useRef(null);
    // A mounted layout can take over navigation between its own routes (no curtain): handler(path) → true when handled.
    const localNavigationRef = useRef(null);
    const registerLocalNavigation = useCallback((handler) => {
        localNavigationRef.current = handler;
        return () => {
            if (localNavigationRef.current === handler) {
                localNavigationRef.current = null;
            }
        };
    }, []);

    const navigateWithTransition = useCallback((path, name, dir = 'right', state) => {
        if (pendingNavigation.current) {
            return false;
        }
        if (localNavigationRef.current?.(path)) {
            return true;
        }
        pendingNavigation.current = path;
        pendingState.current = state || null;
        setPageName(name || null);
        setDirection(dir);
        setTransitionKey((k) => k + 1);
        setCurtainOpen(true);
        return true;
    }, []);

    const onCoverComplete = useCallback(() => {
        if (pendingNavigation.current) {
            // Yield a frame so the curtain fully paints before the heavy route mount
            requestAnimationFrame(() => {
                const navState = {
                    fromNavigation: true,
                    ...pendingState.current,
                };
                navigate(pendingNavigation.current, { state: navState });
                pendingNavigation.current = null;
                pendingState.current = null;
                setCurtainOpen(false);
            });
        }
    }, [navigate]);

    const onRevealComplete = useCallback(() => {
        setCurtainOpen(false);
        setPageName(null);
    }, []);

    return (
        <PageTransitionContext.Provider value={{ navigateWithTransition, registerLocalNavigation }}>
            <CurtainTransition
                key={transitionKey}
                isOpen={curtainOpen}
                direction={direction}
                pageName={pageName}
                onCoverComplete={onCoverComplete}
                onRevealComplete={onRevealComplete}
            />
            {children}
        </PageTransitionContext.Provider>
    );
}
