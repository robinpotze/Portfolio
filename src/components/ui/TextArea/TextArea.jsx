import CrsIcon from '@/assets/icons/CRS.svg?react';
import MsgIcon from '@/assets/icons/MSG.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';

import styles from './TextArea.module.css';

const VARIANT_CLASS = {
    default: styles.field,
    intercept: styles.fieldIntercept,
};

export default function TextArea({ value, onChange, placeholder, disabled, icon: Icon = MsgIcon, decal, variant = 'default', className, ...props }) {
    const fieldClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.default;

    return (
        <div className={`${fieldClass} ${className ?? ''}`}>
            <PlsIcon className={styles.cornerTL} aria-hidden="true" />
            <PlsIcon className={styles.cornerTR} aria-hidden="true" />
            <CrsIcon className={styles.marker} aria-hidden="true" />
            <div className={styles.sidebar}>
                <Icon className={styles.icon} aria-hidden="true" />
                {decal && <span className={styles.decal} aria-hidden="true">{decal}</span>}
            </div>
            <textarea
                className={styles.textarea}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                {...props}
            />
            <PlsIcon className={styles.cornerBL} aria-hidden="true" />
            <PlsIcon className={styles.cornerBR} aria-hidden="true" />
        </div>
    );
}
