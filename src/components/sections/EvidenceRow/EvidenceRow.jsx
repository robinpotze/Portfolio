import styles from './EvidenceRow.module.css';

export default function EvidenceRow({ items }) {
    return (
        <section className={styles.wrapper}>
            {items.map((item) => (
                <div key={item.label} className={styles.item}>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                </div>
            ))}
        </section>
    );
}
