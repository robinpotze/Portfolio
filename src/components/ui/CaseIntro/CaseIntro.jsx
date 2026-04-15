import styles from './CaseIntro.module.css';

export default function CaseIntro({ src, kicker, heading, subtitle }) {
    return (
        <section className={styles.wrapper}>
            <video src={src} autoPlay loop muted playsInline />
            <div className={styles.overlay}>
                {kicker && <label className={styles.kicker}>{kicker}</label>}
                <h1>{heading}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </section>
    );
}
