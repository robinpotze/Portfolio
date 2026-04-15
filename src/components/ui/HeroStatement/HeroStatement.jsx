import styles from './HeroStatement.module.css';

export default function HeroStatement({ label, children }) {
    return (
        <section className={styles.wrapper}>
            {label && <label className={styles.label}>{label}</label>}
            {children}
        </section>
    );
}
