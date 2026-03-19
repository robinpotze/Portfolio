import styles from './StatusMessage.module.css';

const STATUS_CONFIG = {
    success: { icon: '/img/icon/GAT.svg', decal: '/img/decal/PLS.svg' },
    error: { icon: '/img/icon/CRS.svg', decal: '/img/decal/CRS.svg' },
};

export default function StatusMessage({ status = 'success', message }) {
    const { icon, decal } = STATUS_CONFIG[status] ?? STATUS_CONFIG.success;

    return (
        <div className={`${styles.statusMessage} ${styles[status] ?? ''}`}>
            <img className={styles.cornerIconTR} src='/img/icon/PLS.svg' alt='status message corner icon' />
            <div className={styles.iconWrapper}>
                <img className={styles.decoIcon} src={decal} alt="" />
                <img className={styles.statusIcon} src={icon} alt={`${status} icon`} />
            </div>
            <span className={styles.message}>{message}</span>
            <img className={styles.cornerIconBL} src='/img/icon/PLS.svg' alt='status message corner icon' />
        </div>
    );
}