import CrsIcon from '@/assets/icons/CRS.svg?react';
import MsgIcon from '@/assets/icons/MSG.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';
import { useId } from 'react';

import styles from './TextArea.module.css';

const VARIANT_CLASS = {
    default: styles.field,
    intercept: styles.fieldIntercept,
};

export default function TextArea({
    value,
    onChange,
    placeholder,
    label,
    disabled,
    icon: Icon = MsgIcon,
    decal,
    variant = 'default',
    className,
    ...props
}) {
    const fieldClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.default;
    const textareaId = useId();

    return (
        <div className={`${fieldClass} ${className ?? ''}`}>
            <PlsIcon className={styles.cornerTL} aria-hidden="true" />
            <PlsIcon className={styles.cornerTR} aria-hidden="true" />
            <CrsIcon className={styles.marker} aria-hidden="true" />
            <div className={styles.sidebar}>
                <Icon className={styles.icon} aria-hidden="true" />
                {decal && (
                    <span className={styles.decal} aria-hidden="true">
                        {decal}
                    </span>
                )}
            </div>
            <div className={styles.body}>
                {label && (
                    <label htmlFor={textareaId} className={styles.label}>
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={styles.textarea}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    {...props}
                />
            </div>
            <PlsIcon className={styles.cornerBL} aria-hidden="true" />
            <PlsIcon className={styles.cornerBR} aria-hidden="true" />
        </div>
    );
}
