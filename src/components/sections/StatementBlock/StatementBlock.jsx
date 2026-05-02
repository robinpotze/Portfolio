import styles from './StatementBlock.module.css';

export default function StatementBlock({ label, children }) {
    return (
        <section className={styles.wrapper}>
            {label && <label className={styles.label}>{label}</label>}
            {children}
        </section>
    );
}
