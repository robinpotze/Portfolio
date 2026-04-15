import ScrollReveal from '@components/effects/ScrollReveal';

import styles from './WorkSubHeader.module.css';

export default function WorkSubHeader({ label, title, description }) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.section}>
                <span className={styles.label}>{label}</span>
                <h4 className={styles.title}>{title}</h4>
            </div>
            {description && <ScrollReveal>{description}</ScrollReveal>}
        </div>
    );
}
