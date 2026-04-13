import PlsIcon from '@/assets/icons/PLS.svg?react';
import ScrollReveal from '@components/effects/ScrollReveal';
import styles from './WorkHeader.module.css';

export default function WorkHeader({ title, subtitle, description }) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.bar}>
                <div className={styles.barContent}>
                    <h3>{title}</h3>
                    <PlsIcon aria-hidden="true" />
                    <p className="deco-small">{subtitle}</p>
                </div>
            </div>
            <div className={styles.description}>
                <ScrollReveal>{description}</ScrollReveal>
            </div>
        </div>
    );
}
