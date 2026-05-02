import { getInitialQuality } from '@utils/deviceCapability';
import { createContext, useCallback, useContext, useState } from 'react';

const QualityContext = createContext(null);

export function QualityProvider({ children }) {
    const [quality, setQualityState] = useState(getInitialQuality);

    const setQuality = useCallback((newQuality) => {
        setQualityState((currentQuality) => (currentQuality === newQuality ? currentQuality : newQuality));
    }, []);

    return <QualityContext.Provider value={{ quality, setQuality }}>{children}</QualityContext.Provider>;
}

export function useQuality() {
    const context = useContext(QualityContext);
    if (!context) {
        throw new Error('useQuality must be used within QualityProvider');
    }
    return context;
}
