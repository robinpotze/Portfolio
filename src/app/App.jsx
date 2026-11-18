import ErrorBoundary from '@components/ErrorBoundary';
import NavigationMenu from '@components/navigation/NavigationMenu/NavigationMenu';
import { PageTransitionProvider } from '@hooks/usePageTransition';
import { pagesData } from '@routes/Entry/pages/autogen';
import { sortItems } from '@utils/workUtils';
import { Outlet } from 'react-router-dom';
import { QualityProvider } from './QualityContext';
import WorkContext from './WorkContext';

// Static build-time data: sorted once, so the Work page gets the full list on its first render.
const items = sortItems(pagesData);

export default function App() {
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
