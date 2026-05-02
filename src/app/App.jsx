import ErrorBoundary from '@components/ErrorBoundary';
import NavigationMenu from '@components/navigation/NavigationMenu/NavigationMenu';
import { PageTransitionProvider } from '@hooks/usePageTransition';
import { pagesData } from '@routes/Entry/pages/autogen';
import { sortItems } from '@utils/workUtils';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { QualityProvider } from './QualityContext';
import WorkContext from './WorkContext';

export default function App() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems(sortItems(pagesData));
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
