import ScrollReveal from '@components/effects/ScrollReveal';
import entryStyles from '@routes/Entry/Entry.module.css';
import styles from './WorkHeader.module.css';

export default function WorkHeader({ title, subtitle, description }) {
    return (
        <div className={entryStyles.header}>
            <div className={styles.chapter}>
                <h3>{title}</h3>
                <img src="/img/icon/PLS.svg" alt="plus icon divider" />
                <p className="deco-small">{subtitle}</p>
            </div>
            <ScrollReveal>{description}</ScrollReveal>
        </div>
    );
}
