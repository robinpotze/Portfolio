import About from '@routes/About/About.jsx';
import Contact from '@routes/Contact/Contact.jsx';
import Entry from '@routes/Entry/Entry.jsx';
import Home from '@routes/Home/Home.jsx';
import Work from '@routes/Work/Work.jsx';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/work', element: <Work /> },
            { path: '/work/:title', element: <Entry /> },
            { path: '/about', element: <About /> },
            { path: '/contact', element: <Contact /> },
        ],
    },
]);
