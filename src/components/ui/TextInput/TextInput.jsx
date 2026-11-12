import CrsIcon from '@/assets/icons/CRS.svg?react';
import MsgIcon from '@/assets/icons/MSG.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';
import { useId } from 'react';

import styles from './TextInput.module.css';

const VARIANT_CLASS = {
    default: styles.field,
    intercept: styles.fieldIntercept,
};

export default function TextInput({
    value,
    onChange,
    placeholder,
    label,
    disabled,
    icon: Icon = MsgIcon,
    type = 'text',
    variant = 'default',
    className,
    ...props
}) {
    const fieldClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.default;
    const inputId = useId();

    return (
        <div className={`${fieldClass} ${className ?? ''}`}>
            <PlsIcon className={styles.cornerTL} aria-hidden="true" />
            <PlsIcon className={styles.cornerTR} aria-hidden="true" />
            <CrsIcon className={styles.marker} aria-hidden="true" />
            <Icon className={styles.icon} aria-hidden="true" />
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={styles.input}
                type={type}
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
