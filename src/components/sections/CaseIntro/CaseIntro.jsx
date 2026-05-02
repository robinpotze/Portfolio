import styles from './CaseIntro.module.css';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg'];

export default function CaseIntro({ src, kicker, heading, subtitle }) {
    const isVideo = VIDEO_EXTENSIONS.some((ext) => src?.toLowerCase().endsWith(ext));

    return (
        <section className={styles.wrapper}>
            {isVideo ? <video src={src} autoPlay loop muted playsInline /> : <img src={src} alt="" />}
            <div className={styles.overlay}>
                {kicker && <label className={styles.kicker}>{kicker}</label>}
                <h1>{heading}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </section>
    );
}
