import { useWorkItems } from '@app/WorkContext';
import { usePageTransition } from '@hooks/usePageTransition';
import styles from './CaseFooter.module.css';

export default function CaseFooter({ currentKey }) {
    const items = useWorkItems();
    const { navigateWithTransition } = usePageTransition();

    const index = items.findIndex((item) => item.key === currentKey);
    const next = items.length > 1 && index !== -1 ? items[(index + 1) % items.length] : null;

    const onNavigate = (e, path, name) => {
        e.preventDefault();
        navigateWithTransition(path, name, 'up');
    };

    return (
        <nav className={styles.footer} aria-label="Continue">
            {next && (
                <a className={styles.link} href={`/work/${next.key}`} onClick={(e) => onNavigate(e, `/work/${next.key}`, next.data.title)}>
                    <span className={`deco-tiny ${styles.label}`}>NEXT PROJECT</span>
                    <span className={styles.title}>{next.data.title}</span>
                    {next.data.subtitle && <span className={`deco-small ${styles.subtitle}`}>{next.data.subtitle.toUpperCase()}</span>}
                </a>
            )}
            <a className={styles.link} href="/contact" onClick={(e) => onNavigate(e, '/contact', 'Contact')}>
                <span className={`deco-tiny ${styles.label}`}>GET IN TOUCH</span>
                <span className={styles.title}>CONTACT</span>
            </a>
        </nav>
    );
}
