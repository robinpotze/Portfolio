import styles from './ComparisonBlock.module.css';

export default function ComparisonBlock({ label, heading, items }) {
    return (
        <section className={styles.wrapper}>
            <div className={styles.intro}>
                {label && <label className={styles.label}>{label}</label>}
                {heading && <h3>{heading}</h3>}
            </div>
            <div className={styles.grid}>
                {items.map((item) => (
                    <figure key={item.caption}>
                        <figcaption>{item.caption}</figcaption>
                        <img src={item.src} alt={item.alt} />
                    </figure>
                ))}
            </div>
        </section>
    );
}
