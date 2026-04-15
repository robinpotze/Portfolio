import styles from './FullImage.module.css';

export default function FullImage({ src, alt, thin = false, contain = false }) {
    return (
        <div className={`${styles.wrapper} ${thin ? styles.thin : ''}`}>
            <img src={src} alt={alt} className={contain ? styles.contain : undefined} />
        </div>
    );
}
