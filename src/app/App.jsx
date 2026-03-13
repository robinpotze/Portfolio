import ErrorBoundary from '@components/ErrorBoundary';
import NavigationMenu from '@components/layout/NavigationMenu/NavigationMenu';
import { PageTransitionProvider } from '@hooks/usePageTransition';
import { pages as autogenPages } from '@routes/Entry/pages/autogen';
import { sortItems } from '@utils/workUtils';
import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { QualityProvider } from './QualityContext';

const WorkContext = createContext(null);

export const useWorkItems = () => {
    const context = useContext(WorkContext);
    if (!context) throw new Error('useWorkItems must be used within App');
    return context;
};

export default function App() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(sortItems(autogenPages));
    }, []);

    return (
        <QualityProvider>
            <WorkContext.Provider value={items}>
                <PageTransitionProvider>
                    <NavigationMenu />
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </PageTransitionProvider>
            </WorkContext.Provider>
        </QualityProvider>
    );
}
