import { getInitialQuality } from '@utils/deviceCapability';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const QualityContext = createContext(null);

export function QualityProvider({ children }) {
    const [quality, setQualityState] = useState(getInitialQuality);
    const lastChangeRef = useRef(0);

    const setQuality = useCallback((newQuality) => {
        const now = performance.now();
        // Prevent rapid quality changes (minimum 2s between changes)
        if (now - lastChangeRef.current < 2000) return;
        lastChangeRef.current = now;
        setQualityState(newQuality);
    }, []);

    return (
        <QualityContext.Provider value={{ quality, setQuality }}>
            {children}
        </QualityContext.Provider>
    );
}

export function useQuality() {
    const context = useContext(QualityContext);
    if (!context) throw new Error('useQuality must be used within QualityProvider');
    return context;
}
