import styles from './ImageGrid.module.css';

export default function ImageGrid({ images, columns = 4, label, heading }) {
    return (
        <section className={styles.wrapper}>
            {(label || heading) && (
                <div className={styles.intro}>
                    {label && <label className={styles.label}>{label}</label>}
                    {heading && <h3>{heading}</h3>}
                </div>
            )}
            <div className={styles.grid} style={{ '--columns': columns }}>
                {images.map((image) => (
                    <figure key={image.src} className={styles.cell}>
                        <img src={image.src} alt={image.alt} />
                        {image.label && <figcaption>{image.label}</figcaption>}
                    </figure>
                ))}
            </div>
        </section>
    );
}
