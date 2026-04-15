import styles from './FeatureSplit.module.css';

export default function FeatureSplit({ src, alt, reverse = false, label, children }) {
    return (
        <section className={`${styles.wrapper} ${reverse ? styles.reverse : ''}`}>
            <div className={styles.media}>
                <img src={src} alt={alt} />
            </div>
            <div className={styles.body}>
                {label && <label className={styles.label}>{label}</label>}
                {children}
            </div>
        </section>
    );
}
