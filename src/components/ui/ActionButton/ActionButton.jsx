import styles from './ActionButton.module.css';

export default function ActionButton({ children, onClick, disabled, icon, className, ...props }) {
    return (
        <button className={`${styles.button} ${className ?? ''}`} onClick={onClick} disabled={disabled} {...props}>
            {children}
            {icon && <span className="material-symbols-sharp">{icon}</span>}
        </button>
    );
}
