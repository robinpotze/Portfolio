import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

const About = lazy(() => import('@routes/About/About.jsx'));
const Contact = lazy(() => import('@routes/Contact/Contact.jsx'));
const Entry = lazy(() => import('@routes/Entry/Entry.jsx'));
const Home = lazy(() => import('@routes/Home/Home.jsx'));
const Work = lazy(() => import('@routes/Work/Work.jsx'));

function withSuspense(element) {
    return <Suspense fallback={null}>{element}</Suspense>;
}

export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            { path: '/', element: withSuspense(<Home />) },
            { path: '/work', element: withSuspense(<Work />) },
            { path: '/work/:title', element: withSuspense(<Entry />) },
            { path: '/about', element: withSuspense(<About />) },
            { path: '/contact', element: withSuspense(<Contact />) },
        ],
    },
]);
