import PageTitle from '@components/ui/PageTitle/PageTitle';
import { usePageTransition } from '@hooks/usePageTransition';

import styles from './NotFound.module.css';

const LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Work', path: '/work' },
];

export default function NotFound({ message = 'This page does not exist.' }) {
    const { navigateWithTransition } = usePageTransition();

    const onLinkClick = (e, path, label) => {
        e.preventDefault();
        navigateWithTransition(path, label);
    };

    return (
        <div className={styles.page}>
            <PageTitle name="Not found" />
            <h1 className={styles.code}>404</h1>
            <p className={styles.status}>SIGNAL.LOST</p>
            <p className={styles.message}>{message}</p>
            <nav className={styles.links}>
                {LINKS.map(({ label, path }) => (
                    <a key={path} className={styles.link} href={path} onClick={(e) => onLinkClick(e, path, label)}>
                        {label}
                    </a>
                ))}
            </nav>
        </div>
    );
}
