import styles from './WorkLabel.module.css';

export default function WorkLabel({ text }) {
    return (
        <div className={styles.wrapper}>
            <p className={styles.label}>{text}</p>
        </div>
    );
}
