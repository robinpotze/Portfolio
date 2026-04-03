import CurtainTransition from '@components/effects/CurtainTransition';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PageTransitionContext = createContext(null);

export const usePageTransition = () => {
    const context = useContext(PageTransitionContext);
    if (!context) {
        throw new Error('usePageTransition must be used within PageTransitionProvider');
    }
    return context;
};

export function PageTransitionProvider({ children }) {
    const navigate = useNavigate();
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [pageName, setPageName] = useState(null);
    const [direction, setDirection] = useState('right');
    const pendingNavigation = useRef(null);
    const pendingState = useRef(null);
    const transitionKey = useRef(0);

    const navigateWithTransition = useCallback((path, name, dir = 'right', state) => {
        if (pendingNavigation.current) {
            return;
        }
        pendingNavigation.current = path;
        pendingState.current = state || null;
        setPageName(name || null);
        setDirection(dir);
        transitionKey.current += 1;
        setCurtainOpen(true);
    }, []);

    const handleCoverComplete = useCallback(() => {
        if (pendingNavigation.current) {
            const navState = { fromNavigation: true, ...pendingState.current };
            navigate(pendingNavigation.current, { state: navState });
            pendingNavigation.current = null;
            pendingState.current = null;
        }
        setCurtainOpen(false);
    }, [navigate]);

    const handleRevealComplete = useCallback(() => {
        setCurtainOpen(false);
        setPageName(null);
    }, []);

    return (
        <PageTransitionContext.Provider value={{ navigateWithTransition }}>
            <CurtainTransition
                key={transitionKey.current}
                isOpen={curtainOpen}
                direction={direction}
                pageName={pageName}
                onCoverComplete={handleCoverComplete}
                onRevealComplete={handleRevealComplete}
            />
            {children}
        </PageTransitionContext.Provider>
    );
}
