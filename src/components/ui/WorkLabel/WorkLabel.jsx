import entryStyles from '@routes/Entry/Entry.module.css';
import styles from './WorkLabel.module.css';

export default function WorkLabel({ text }) {
    return (
        <div className={entryStyles.header}>
            <p className={styles.label}>{text}</p>
        </div>
    );
}
